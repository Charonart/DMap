const pool = require("../config/db");

exports.getPois = async (req, res) => {
  try {
    const { category, bbox, min_score, feature } = req.query;
    // Fix #14: Add pagination
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    let query = `
      SELECT
        p.id, p.name, p.name_vi, p.description, p.address,
        ST_AsGeoJSON(p.location)::json AS geometry,
        ST_X(p.location) AS lng,
        ST_Y(p.location) AS lat,
        p.category_id, c.name AS category_name, c.name_vi AS category_name_vi, c.icon AS category_icon,
        p.phone, p.website, p.opening_hours,
        p.overall_score, p.is_verified,
        p.created_at, p.updated_at
      FROM pois p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_hidden = FALSE AND p.status = 'approved' AND p.deleted_at IS NULL
    `;
    const params = [];
    let idx = 1;

    if (category) {
      query += ` AND p.category_id = $${idx}`;
      params.push(category);
      idx++;
    }

    if (min_score) {
      query += ` AND p.overall_score >= $${idx}`;
      params.push(parseInt(min_score));
      idx++;
    }

    if (bbox) {
      const [swLng, swLat, neLng, neLat] = bbox.split(",").map(Number);
      query += ` AND ST_Within(p.location, ST_MakeEnvelope($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, 4326))`;
      params.push(swLng, swLat, neLng, neLat);
      idx += 4;
    }

    if (feature) {
      query += ` AND EXISTS (
        SELECT 1 FROM poi_accessibility pa
        WHERE pa.poi_id = p.id AND pa.feature_id = $${idx} AND pa.is_available = TRUE
      )`;
      params.push(parseInt(feature));
      idx++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    res.json({ status: "success", data: rows, pagination: { limit, offset } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getNearbyPois = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ status: "error", message: "lat and lng are required" });
    }

    const { rows } = await pool.query(
      `
      SELECT
        p.id, p.name, p.name_vi, p.description, p.address,
        ST_AsGeoJSON(p.location)::json AS geometry,
        ST_X(p.location) AS lng, ST_Y(p.location) AS lat,
        p.category_id, c.name AS category_name, c.icon AS category_icon,
        p.overall_score, p.is_verified,
        ST_Distance(
          p.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance_meters
      FROM pois p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_hidden = FALSE AND p.status = 'approved' AND p.deleted_at IS NULL AND ST_DWithin(
        p.location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
      ORDER BY distance_meters
      LIMIT $4
    `,
      [parseFloat(lng), parseFloat(lat), parseInt(radius), limit],
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getPoiGeoJson = async (req, res) => {
  try {
    const {
      category,
      min_score,
      features,
      search,
      min_lng,
      min_lat,
      max_lng,
      max_lat,
    } = req.query;

    // Normal users only see approved and not deleted
    let whereClause = "p.is_hidden = FALSE AND p.deleted_at IS NULL";
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "moderator")
    ) {
      whereClause += " AND p.status = 'approved'";
    } else {
      whereClause += " AND p.status != 'rejected'";
    }

    const params = [];
    let idx = 1;

    if (category) {
      whereClause += ` AND p.category_id = $${idx}`;
      params.push(category);
      idx++;
    }
    if (min_score) {
      whereClause += ` AND p.overall_score >= $${idx}`;
      params.push(parseInt(min_score));
      idx++;
    }
    if (features) {
      const featureList = features.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (featureList.length > 0) {
        whereClause += ` AND (
          SELECT COUNT(DISTINCT feature_id) FROM poi_accessibility 
          WHERE poi_id = p.id AND feature_id = ANY($${idx}) AND is_available = TRUE
        ) >= ${featureList.length}`;
        params.push(featureList);
        idx++;
      }
    }
    if (search) {
      whereClause += ` AND (p.name ILIKE $${idx} OR p.name_vi ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (min_lng && min_lat && max_lng && max_lat) {
      whereClause += ` AND ST_Within(p.location, ST_MakeEnvelope($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, 4326))`;
      params.push(
        parseFloat(min_lng),
        parseFloat(min_lat),
        parseFloat(max_lng),
        parseFloat(max_lat),
      );
      idx += 4;
    }

    const { rows } = await pool.query(
      `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.location)::json,
            'properties', json_build_object(
              'id', p.id,
              'name', p.name,
              'name_vi', p.name_vi,
              'address', p.address,
              'category', c.name,
              'category_vi', c.name_vi,
              'category_icon', c.icon,
              'overall_score', p.overall_score,
              'is_verified', p.is_verified,
              'status', p.status
            )
          )
        ), '[]'::json)
      ) AS geojson
      FROM (
        SELECT p.*
        FROM pois p
        WHERE ${whereClause}
        ORDER BY p.overall_score DESC
        LIMIT 500
      ) p
      LEFT JOIN categories c ON p.category_id = c.id
    `,
      params,
    );

    res.json(rows[0].geojson);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getPoiById = async (req, res) => {
  try {
    const poiId = parseInt(req.params.id);
    const poiResult = await pool.query(
      `
      SELECT
        p.id, p.name, p.name_vi, p.description, p.address,
        ST_AsGeoJSON(p.location)::json AS geometry,
        ST_X(p.location) AS lng, ST_Y(p.location) AS lat,
        p.category_id, c.name AS category_name, c.name_vi AS category_name_vi, c.icon AS category_icon,
        p.phone, p.website, p.opening_hours,
        p.overall_score, p.is_verified, p.status,
        p.user_id, p.created_at, p.updated_at
      FROM pois p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `,
      [poiId],
    );

    if (poiResult.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "POI not found" });
    }

    const featuresResult = await pool.query(
      `
      SELECT
        af.id, af.name, af.name_vi, af.icon, af.feature_group,
        pa.is_available, pa.quality_rating, pa.note
      FROM poi_accessibility pa
      JOIN accessibility_features af ON pa.feature_id = af.id
      WHERE pa.poi_id = $1
      ORDER BY af.feature_group
    `,
      [poiId],
    );

    // Fix #19: SELECT specific columns, exclude sensitive user_id from reviews
    const reviewsResult = await pool.query(
      `
      SELECT ur.id, ur.poi_id, ur.reviewer_name, ur.rating, ur.comment,
             ur.disability_type, ur.visited_at, ur.created_at,
             p.image_url
      FROM user_reviews ur
      LEFT JOIN poi_photos p ON ur.id = p.review_id
      WHERE ur.poi_id = $1
      ORDER BY ur.created_at DESC LIMIT 20
    `,
      [poiId],
    );

    const user = req.user;
    const poiData = poiResult.rows[0];
    const isOwner = user && String(user.id) === String(poiData.user_id);
    const isAdmin =
      user && (user.role === "admin" || user.role === "moderator");

    res.json({
      status: "success",
      data: {
        ...poiData,
        permissions: {
          can_edit: !!(isOwner || isAdmin),
          can_delete: !!(isOwner || isAdmin),
        },
        accessibility_features: featuresResult.rows,
        reviews: reviewsResult.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.createPoi = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      name,
      name_vi,
      description,
      address,
      lat,
      lng,
      category_id,
      phone,
      website,
      opening_hours,
      accessibility_features,
    } = req.body;

    const user_id = req.user.id;

    if (!name || lat == null || lng == null) {
      return res
        .status(400)
        .json({ status: "error", message: "name, lat, lng are required" });
    }

    const poiStatus =
      req.user.role === "admin" || req.user.role === "moderator"
        ? "approved"
        : "pending";

    const poiResult = await client.query(
      `
      INSERT INTO pois (name, name_vi, description, address, location, category_id, phone, website, opening_hours, user_id, status)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9, $10, $11, $12)
      RETURNING id, name, ST_X(location) AS lng, ST_Y(location) AS lat, status
    `,
      [
        name,
        name_vi,
        description,
        address,
        parseFloat(lng),
        parseFloat(lat),
        category_id,
        phone,
        website,
        opening_hours,
        user_id,
        poiStatus,
      ],
    );

    const poiId = poiResult.rows[0].id;

    if (accessibility_features && accessibility_features.length > 0) {
      for (const feat of accessibility_features) {
        if (
          feat.quality_rating &&
          (feat.quality_rating < 1 || feat.quality_rating > 10)
        ) {
          await client.query("ROLLBACK");
          return res
            .status(400)
            .json({ status: "error", message: "quality_rating must be 1-10" });
        }
        await client.query(
          `
          INSERT INTO poi_accessibility (poi_id, feature_id, is_available, quality_rating, note, reported_by)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            poiId,
            feat.feature_id,
            feat.is_available ?? true,
            feat.quality_rating,
            feat.note,
            user_id,
          ],
        );
      }

      await client.query("SELECT recalculate_poi_score($1)", [poiId]);
    }

    await client.query("COMMIT");
    res.status(201).json({ status: "success", data: poiResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    client.release();
  }
};

exports.updatePoi = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const poiCheck = await client.query(
      "SELECT * FROM pois WHERE id = $1 AND deleted_at IS NULL",
      [parseInt(req.params.id)],
    );
    if (poiCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ status: "error", message: "POI not found" });
    }
    const oldPoi = poiCheck.rows[0];

    if (
      String(oldPoi.user_id) !== String(req.user.id) &&
      req.user.role !== "admin" &&
      req.user.role !== "moderator"
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You do not own this POI",
      });
    }

    // Fix #9: Simplified audit log — always use req.params.id
    await client.query(
      "INSERT INTO edit_history (user_id, poi_id, previous_data, action_type) VALUES ($1, $2, $3, $4)",
      [req.user.id, parseInt(req.params.id), JSON.stringify(oldPoi), "update"],
    );

    const {
      name,
      name_vi,
      description,
      address,
      lat,
      lng,
      category_id,
      phone,
      website,
      opening_hours,
    } = req.body;

    const result = await client.query(
      `
      UPDATE pois SET
        name = COALESCE($1, name),
        name_vi = COALESCE($2, name_vi),
        description = COALESCE($3, description),
        address = COALESCE($4, address),
        location = CASE WHEN $5::float IS NOT NULL AND $6::float IS NOT NULL
                        THEN ST_SetSRID(ST_MakePoint($5, $6), 4326)
                        ELSE location END,
        category_id = COALESCE($7, category_id),
        phone = COALESCE($8, phone),
        website = COALESCE($9, website),
        opening_hours = COALESCE($10, opening_hours),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND deleted_at IS NULL
      RETURNING id, name, ST_X(location) AS lng, ST_Y(location) AS lat
    `,
      [
        name,
        name_vi,
        description,
        address,
        lng ? parseFloat(lng) : null,
        lat ? parseFloat(lat) : null,
        category_id,
        phone,
        website,
        opening_hours,
        parseInt(req.params.id),
      ],
    );

    await client.query("COMMIT");
    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    client.release();
  }
};

exports.deletePoi = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const poiCheck = await client.query(
      "SELECT * FROM pois WHERE id = $1 AND deleted_at IS NULL",
      [parseInt(req.params.id)],
    );
    if (poiCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ status: "error", message: "POI not found" });
    }
    const oldPoi = poiCheck.rows[0];

    if (
      String(oldPoi.user_id) !== String(req.user.id) &&
      req.user.role !== "admin" &&
      req.user.role !== "moderator"
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You do not own this POI",
      });
    }

    await client.query(
      "INSERT INTO edit_history (user_id, poi_id, previous_data, action_type) VALUES ($1, $2, $3, $4)",
      [req.user.id, parseInt(req.params.id), JSON.stringify(oldPoi), "delete"],
    );

    const result = await client.query(
      "UPDATE pois SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
      [parseInt(req.params.id)],
    );
    await client.query("COMMIT");
    res.json({
      status: "success",
      message: "POI deleted (soft)",
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    client.release();
  }
};

exports.rollbackPoi = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const historyCheck = await client.query(
      "SELECT * FROM edit_history WHERE id = $1",
      [parseInt(req.params.history_id)],
    );
    if (historyCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ status: "error", message: "History record not found" });
    }

    const record = historyCheck.rows[0];
    const data = record.previous_data;

    if (record.action_type === "delete") {
      // Fix #10 & #11: ON CONFLICT → restore soft-deleted POI properly
      await client.query(
        `
        INSERT INTO pois (id, name, name_vi, description, address, location, overall_score, is_verified, category_id, phone, website, opening_hours, user_id, status, is_hidden, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'approved', FALSE, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          deleted_at = NULL,
          status = 'approved',
          is_hidden = FALSE,
          name = EXCLUDED.name,
          name_vi = EXCLUDED.name_vi,
          description = EXCLUDED.description,
          address = EXCLUDED.address,
          location = EXCLUDED.location,
          overall_score = EXCLUDED.overall_score,
          category_id = EXCLUDED.category_id,
          updated_at = CURRENT_TIMESTAMP
      `,
        [
          data.id,
          data.name,
          data.name_vi,
          data.description,
          data.address,
          data.location,
          data.overall_score,
          data.is_verified,
          data.category_id,
          data.phone,
          data.website,
          data.opening_hours,
          data.user_id,
          data.created_at,
          data.updated_at,
        ],
      );
    } else {
      await client.query(
        `
        UPDATE pois SET
          name = $1, name_vi = $2, description = $3, address = $4, location = $5,
          category_id = $6, phone = $7, website = $8, opening_hours = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
      `,
        [
          data.name,
          data.name_vi,
          data.description,
          data.address,
          data.location,
          data.category_id,
          data.phone,
          data.website,
          data.opening_hours,
          data.id,
        ],
      );
    }

    await client.query("DELETE FROM edit_history WHERE id = $1", [
      parseInt(req.params.history_id),
    ]);
    await client.query("COMMIT");
    res.json({
      status: "success",
      message: "Rollback successful",
      data: { poi_id: record.poi_id },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    client.release();
  }
};

exports.flagPoi = async (req, res) => {
  const client = await pool.connect();
  try {
    const { reason } = req.body;
    const poiId = parseInt(req.params.id);
    const userId = req.user.id;

    await client.query("BEGIN");

    const flagCheck = await client.query(
      "SELECT id FROM poi_flags WHERE poi_id = $1 AND user_id = $2",
      [poiId, userId],
    );
    if (flagCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: "error",
        message: "You have already flagged this location",
      });
    }

    await client.query(
      "INSERT INTO poi_flags (poi_id, user_id, reason) VALUES ($1, $2, $3)",
      [poiId, userId, reason],
    );

    const updateRes = await client.query(
      `
      UPDATE pois 
      SET flag_count = flag_count + 1,
          is_hidden = CASE WHEN flag_count + 1 >= 5 THEN TRUE ELSE FALSE END 
      WHERE id = $1
      RETURNING flag_count, is_hidden
    `,
      [poiId],
    );

    await client.query("COMMIT");
    res.json({
      status: "success",
      message: "POI flagged successfully",
      data: updateRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    client.release();
  }
};
