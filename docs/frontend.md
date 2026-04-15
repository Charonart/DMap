# DMap Frontend: Technical Deep-Dive

Chào mừng bạn đến với tài liệu giải ngẫu toàn bộ "vũ trụ" công nghệ đằng sau frontend của dự án DMap. 

Nếu bạn là người đã quen thuộc với bộ ba **HTML, CSS, và JavaScript** thuần túy, bạn có thể sẽ thấy choáng ngợp khi lần đầu mở code dự án này. Đừng lo! Tài liệu này được viết để giúp bạn hiểu được tại sao chúng ta lại dùng nhiều công cụ đến thế, và những khái niệm mới này thực chất đang giải quyết vấn đề gì.

---

## 1. Nền tảng cốt lõi (Foundations)

### Next.js (Framework)
Ngày xưa, bạn tạo `index.html`, `about.html`. Với Next.js, chúng ta dùng **App Router**. 
*   **Tại sao dùng nó?** Nó tự động hóa việc chia file (Routing), tối ưu hóa SEO (Server Side Rendering), và xử lý việc tải trang cực nhanh mà không cần load lại trình duyệt (Single Page Application - SPA).
*   **Cấu trúc chính**: Mọi thứ nằm trong thư mục `src/app`. Một thư mục chứa file `page.tsx` sẽ tự động trở thành một đường dẫn (route).

### React 19 (Library)
Đây là thư viện dùng để xây dựng giao diện dựa trên **Component** (Thành phần).
*   **Điểm mới**: Thay vì viết một file HTML dài dằng dặc, chúng ta chia giao diện thành các mảnh nhỏ tái sử dụng được (như `Button`, `Navbar`, `MapCard`).
*   **Mental Model**: Bạn không còn đi tìm phần tử bằng `document.getElementById` nữa. Bạn chỉ cần nói: "Nếu state (trạng thái) là A, giao diện sẽ trông như thế này". React sẽ tự lo phần còn lại.

### TypeScript (Language)
Hãy coi TypeScript là **JavaScript có "siêu năng lực"**.
*   **Sự khác biệt**: Trong JS, bạn có thể vô tình cộng một con số với một object và nó chỉ lỗi khi chạy (Runtime error). Trong TS, IDE sẽ báo đỏ ngay lập tức nếu bạn truyền sai kiểu dữ liệu.
*   **Lợi ích**: Code tự nó là tài liệu. Nhìn vào một component, bạn biết ngay nó cần những "prop" (dữ liệu truyền vào) nào.

---

## 2. Chiến lược thiết kế & Giao diện (Styling & UI)

### SCSS (Sass) & CSS Modules
Chúng ta không dùng CSS thuần hay Tailwind. Dự án sử dụng **SCSS** kết hợp với **CSS Modules** (`.module.scss`).
*   **Tại sao không dùng Tailwind?** Tailwind rất nhanh nhưng đôi khi làm file HTML/JSX trở nên cực kỳ rác. SCSS giúp chúng ta giữ logic giao diện tách biệt hoàn toàn. Ngoài ra, SCSS cho phép viết các logic phức tạp như *Glassmorphism* (hiệu ứng kính mờ) hay các animation tinh tế một cách sạch sẽ hơn.
*   **CSS Modules**: Giúp style của component A không bao giờ bị "đè" hay ảnh hưởng lên component B (Scoped CSS).

### Radix UI
Đây là bộ **Headless UI**.
*   **Khái niệm**: Radix cung cấp "xương cốt" cho các component phức tạp (như Modal, Dropdown, Accordion) mà không hề có style. Nó lo phần logic khó nhất: Khả năng truy cập (Accessibility - WCAG), điều khiển bằng phím, và hành vi logic. Nhiệm vụ của chúng ta chỉ là đắp "thịt" (style SCSS) lên cái khung đó.

### CVA (Class Variance Authority)
Công cụ này giúp chúng ta tạo ra các **biến thể** cho component.
*   Ví dụ: Một cái `Button` có thể có kiểu `primary`, `outline`, `ghost` với các kích thước `sm`, `lg`. CVA giúp quản lý các class này một cách logic, tránh việc viết `if-else` lồng nhau trong phần giao diện.

### Lucide React
Bộ icon mã nguồn mở, nhẹ và đẹp. Dễ dàng thay đổi màu sắc, kích thước như một component React thông thường.

---

## 3. Quản lý trạng thái & Dữ liệu (State & Data)

### Zustand (Client State)
Ngày xưa bạn dùng biến toàn cục hoặc `localStorage`. Zustand là một kho chứa dữ liệu (Store) cực nhẹ.
*   **Sử dụng**: Lưu trữ thông tin người dùng đã đăng nhập, cài đặt ngôn ngữ, hay các trạng thái giao diện cần dùng ở nhiều nơi (như "Sidebar đang mở hay đóng?").

### TanStack React Query (Server State)
Đây là "trái tim" của phần giao tiếp API.
*   **Công việc**: Nó lo việc fetch dữ liệu từ server, tự động **cache** (lưu nháp), tự động fetch lại khi mất mạng và có lại, quản lý trạng thái `isLoading`, `isError`.
*   **Tại sao dùng nó?** Bạn sẽ không bao giờ phải viết `useEffect` rồi `fetch` rồi `setState` thủ công cho mọi API nữa.

### Axios
Dùng thay thế cho hàm `fetch()` của trình duyệt. 
*   **Ưu điểm**: Cấu hình dễ dàng cho Headers (như token đăng nhập), xử lý lỗi chuyên nghiệp hơn và hỗ trợ tốt hơn cho các trình duyệt cũ.

---

## 4. Xử lý bản đồ & Hình ảnh (Geospatial & Media)

### MapLibre GL JS
Đây là lựa chọn "vàng" để hiển thị bản đồ vector.
*   **Tại sao chọn MapLibre thay vì Mapbox hay Google Maps?**
    *   **Mapbox**: Trước đây rất tốt nhưng hiện tại đã tính phí rất cao và mã nguồn đóng.
    *   **Google Maps**: Tùy biến rất hạn chế khi muốn làm các hiệu ứng "xịn xò" trên nền vector tile.
    *   **MapLibre**: Hoàn toàn miễn phí, mã nguồn mở, cho phép can thiệp sâu vào styling của từng layer bản đồ.

### Cloudinary (Media Hosting)
Dự án sử dụng Cloudinary để quản lý hình ảnh (các bức ảnh chụp POI của người dùng).
*   **Lợi ích**: Thay vì lưu ảnh trực tiếp trên server (làm nặng server và chậm web), Cloudinary tự động tối ưu hóa dung lượng ảnh, tự động resize dựa trên thiết bị người dùng và cung cấp CDN để tải ảnh cực nhanh.

---

## 5. Hỗ trợ thiết bị di động & PWA

### Manifest (`manifest.ts`)
Bạn sẽ thấy file `src/app/manifest.ts`. Đây là thứ biến website của chúng ta thành một **Progressive Web App (PWA)**.
*   **Tính năng**: Nó định nghĩa tên ứng dụng, icon, màu sắc giao diện khi người dùng "Thêm vào màn hình chính" (Add to Home Screen) trên điện thoại. Website sẽ trông và hoạt động như một App di động thực thụ.

---

## 6. Chất lượng Code & Tiêu chuẩn (Quality Control)

### ESLint
Đây là "người gác cổng" cho chất lượng code.
*   **Vai trò**: Nó tự động kiểm tra và nhắc nhở nếu bạn viết code không đúng tiêu chuẩn, quên khai báo biến, hoặc sử dụng các pattern dễ gây lỗi. Nó đảm bảo toàn bộ team viết code theo một phong cách thống nhất.

### React Compiler (Babel/Compiler)
Dự án sử dụng React Compiler mới nhất (trong `package.json`).
*   **Lợi ích**: Nó tự động tối ưu hóa việc render của React mà bạn không cần phải dùng `useMemo` hay `useCallback` thủ công như trước. Web sẽ mượt mà hơn một cách tự động.

---

## 7. Lộ trình "Cũ sang Mới" (Old vs New Roadmap)

| Tính năng | Kiểu truyền thống (HTML/JS) | Kiểu DMap (Hiện đại) |
| :--- | :--- | :--- |
| **Giao diện** | Viết file `.html` | Viết file `.tsx` (React Components) |
| **Routing** | Chuyển file thực tế (link tới `abc.html`) | App Router (File-system routing) |
| **Styling** | Một file `style.css` khổng lồ | SCSS + CSS Modules (Chia nhỏ theo file) |
| **Biến toàn cục** | `window.myData = ...` | Zustand Stores |
| **Lấy dữ liệu** | `xhr.onreadystatechange` hoặc `fetch()` | TanStack Query + Axios |
| **Lưu trữ ảnh** | Lưu trong thư mục `public/images` | Cloudinary (External CDN) |
| **App Di động** | Phải viết App Android/iOS riêng | PWA Manifest (Cài đặt từ trình duyệt) |
| **Kiểm tra lỗi** | Để trình duyệt báo lỗi | ESLint + TypeScript (Báo lỗi khi gõ) |

---

## 8. Cấu trúc thư mục dự án (Project Structure)

Để không bị lạc trong `src/`, hãy nhớ:
-   `app/`: Chứa các trang (routes) và layout chính.
-   `components/`:
    -   `ui/`: Các "nguyên tử" giao diện (Button, Input, Card).
    -   `map/`: Mọi thứ liên quan đến bản đồ (Marker, Popup).
    -   `auth/`: Xử lý đăng nhập, đăng ký.
-   `hooks/`: Các logic lặp đi lặp lại được đóng gói thành hàm.
-   `stores/`: Nơi chứa các Zustand store (Quản lý trạng thái).
-   `styles/`: Các file SCSS định nghĩa màu sắc, font chữ (Design Tokens).
-   `lib/`: Các tiện ích cấu hình (ví dụ: cấu hình Axios, hàm helper).

---

## 9. Hạ tầng & Cấu hình (Infrastructure & Config)

### Biến môi trường (`.env`)
Dự án sử dụng các file `.env` để lưu trữ các thông tin nhạy cảm (như API Key, URL Backend). 
*   **Tại sao cần?** Nó giúp bạn dễ dàng thay đổi địa chỉ server từ "máy local" sang "server thật" mà không cần sửa code.

### Docker & Standalone Build
Bạn sẽ thấy file `Dockerfile` và dòng `output: 'standalone'` trong `next.config.ts`.
*   **Standalone**: Đây là chế độ tối ưu nhất của Next.js để chạy trong Docker. Nó chỉ đóng gói những gì thực sự cần thiết, giúp image Docker cực nhẹ và khởi động nhanh.
*   **Docker**: Đảm bảo môi trường chạy code luôn đồng nhất giữa các máy tính.

---

Tài liệu này không bắt bạn phải hiểu hết ngay lập tức. Hãy vừa code vừa đối chiếu với file này. Khi bạn thắc mắc "Cái `useQuery` này là gì?", hãy quay lại mục **Số 3**. Khi không biết để màu ở đâu, hãy xem mục **Số 6**.

Chúc bạn có những giây phút "coding" thú vị cùng DMap!
