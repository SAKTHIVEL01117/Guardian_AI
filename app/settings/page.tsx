"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Settings, Shield, Cpu, Bell, Lock, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            System &amp; AI Configuration
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Configure computer vision thresholds, alert sensitivity, and InsForge database settings.
          </p>
        </div>

        <div className="bg-card-bg rounded-3xl p-6 md:p-8 border border-border-default shadow-card space-y-6 max-w-3xl">
          {/* Section 1: AI Thresholds */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span>AI Fatigue Detection Sensitivity</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">
                  Critical Fatigue Score Threshold
                </label>
                <input
                  type="number"
                  defaultValue={75}
                  className="w-full p-3 bg-white border border-border-default rounded-xl font-bold text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">
                  Min Recognition Confidence Threshold
                </label>
                <input
                  type="number"
                  defaultValue={85}
                  className="w-full p-3 bg-white border border-border-default rounded-xl font-bold text-text-primary"
                />
              </div>
            </div>
          </div>

          <hr className="border-border-default" />

          {/* Section 2: InsForge Integration Meta */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              <span>InsForge Backend Link</span>
            </h2>

            <div className="bg-secondary-surface/60 p-4 rounded-2xl text-xs space-y-2 font-mono">
              <div className="text-text-secondary">Project: Guardian AI (g794t578.us-east.insforge.app)</div>
              <div className="text-text-muted">PostgreSQL RLS Policies: ACTIVE</div>
              <div className="text-text-muted">Storage Bucket: worker-images (Public)</div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => alert("System settings updated successfully!")}
              className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/20 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

