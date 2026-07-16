"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

const SETTINGS_CARDS = [
  {
    title: "Storefront",
    icon: "storefront",
    description: "Manage your store branding, logos, and display settings.",
    items: [
      { label: "Store Name", value: "Nexus ERP" },
      { label: "Store URL", value: "https://nexus-erp.com" },
      { label: "Currency", value: "INR" },
      { label: "Timezone", value: "Asia/Kolkata" },
    ],
  },
  {
    title: "Payments",
    icon: "payments",
    description: "Configure payment gateways and transaction settings.",
    items: [
      { label: "Gateway", value: "Razorpay" },
      { label: "Mode", value: "Production", badge: "success" },
      { label: "Webhook", value: "Configured", badge: "success" },
      { label: "Auto-capture", value: "Enabled" },
    ],
  },
  {
    title: "Email",
    icon: "email",
    description: "Email templates and SMTP configuration.",
    items: [
      { label: "Provider", value: "SMTP" },
      { label: "From Address", value: "noreply@nexus-erp.com" },
      { label: "Templates", value: "12 active" },
      { label: "Daily Limit", value: "500 emails" },
    ],
  },
  {
    title: "Security",
    icon: "shield",
    description: "Authentication, encryption, and security policies.",
    items: [
      { label: "2FA", value: "Enabled", badge: "success" },
      { label: "Session Timeout", value: "24 hours" },
      { label: "Password Policy", value: "Strong" },
      { label: "API Rate Limit", value: "100 req/min" },
    ],
  },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your ERP system"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SETTINGS_CARDS.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">{section.icon}</span>
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    {item.badge ? (
                      <Badge variant={item.badge}>{item.value}</Badge>
                    ) : (
                      <span className="text-xs font-medium">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
