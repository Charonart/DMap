'use client';
import { Button } from "@/components/ui/Button";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/Toast";
import { Settings, Plus, Menu, Search, User } from "lucide-react";

export default function CoreUISandbox() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-32">
      <div>
        <h1 className="text-h1 mb-2">DMap Core UI Kit (15+ Components)</h1>
        <p className="text-body text-on-surface-variant">
          Full showcase of the fully accessible Radix + Tailwind v4 components built for DMap Phase 3 Map UI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Buttons */}
        <section className="p-6 bg-surface-container-low rounded-xl space-y-4">
          <h2 className="text-h2">1. Buttons & Badges</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="fab" size="icon"><Plus className="w-5 h-5"/></Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center pt-2">
            <ScoreBadge score={9.5} />
            <ScoreBadge score={7.2} />
            <ScoreBadge score={5.0} />
            <ScoreBadge score={3.0} />
            <ScoreBadge score={1.2} />
            <ScoreBadge score={0} />
          </div>
        </section>

        {/* Inputs & Form Controls */}
        <section className="p-6 bg-surface-container-low rounded-xl space-y-6">
          <h2 className="text-h2">2. Form Controls</h2>
          
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input placeholder="Enter email" leftIcon={<User className="w-4 h-4"/>} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Write a review..." />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms</Label>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">High Contrast</Label>
            </div>
          </div>
        </section>

        {/* Overlays (Sheet & Dialog) */}
        <section className="p-6 bg-surface-container-low rounded-xl space-y-6">
          <h2 className="text-h2">3. Overlays (Modals & Drawers)</h2>
          
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Modal Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Point of Interest</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new location.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <Input placeholder="Location Name" />
                  <Button className="w-full">Submit</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="primary">Open Bottom Sheet</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>POI Detail Panel</SheetTitle>
                  <SheetDescription>
                    This will act as the sidebar holding reviews.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <ScoreBar score={8} />
                  <Skeleton className="w-full h-32" />
                  <Skeleton className="w-full h-8" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        {/* Interaction (Tabs, Accordion, Tooltips) */}
        <section className="p-6 bg-surface-container-low rounded-xl space-y-6">
          <h2 className="text-h2">4. Complex Interactions</h2>
          
          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-4 bg-surface-container-lowest border border-outline/20">
              Overview Details
            </TabsContent>
            <TabsContent value="reviews" className="p-4 bg-surface-container-lowest border border-outline/20">
              No reviews yet.
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Accordion */}
          <Accordion type="single" collapsible className="w-full bg-surface-container-lowest px-4 rounded-md">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wheelchair Categories</AccordionTrigger>
              <AccordionContent>
                Must have flat entrance and elevators.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Separator />
          
          <div className="flex gap-4 items-center">
            {/* Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon"><Settings className="w-5 h-5"/></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accessibility Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Slider */}
            <div className="flex-1 px-4">
              <Slider defaultValue={[5]} max={10} step={1} />
            </div>
            {/* Spinner */}
            <Spinner />
          </div>
        </section>

        {/* Info Displays */}
        <section className="p-6 bg-surface-container-low rounded-xl space-y-6 md:col-span-2">
          <h2 className="text-h2">5. Data Display (Card, Toast)</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bệnh viện Thống Nhất</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Chip variant="selected">Wheelchair</Chip>
                  <Chip variant="outline">Hospital</Chip>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-label">
                    <span>Overall Score</span>
                    <span>8.5/10</span>
                  </div>
                  <ScoreBar score={8.5} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-body text-on-surface-variant mb-2">Example Toast Design (Sonner wrapper preview):</p>
              <Toast>
                <div className="flex flex-col gap-1">
                  <ToastTitle>Add POI Success</ToastTitle>
                  <ToastDescription>We are processing your location data.</ToastDescription>
                </div>
                <Button variant="ghost" size="sm">Undo</Button>
              </Toast>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
