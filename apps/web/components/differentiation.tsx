'use client';

import { Check, X } from 'lucide-react';

const comparison = [
  { feature: 'Project Discovery', nexcore: true, others: false },
  { feature: 'Real-time Chat', nexcore: true, others: true },
  { feature: 'Task Management', nexcore: true, others: true },
  { feature: 'Skill-based Matching', nexcore: true, others: false },
  { feature: 'Integrated Workspace', nexcore: true, others: false },
  { feature: 'Developer Community', nexcore: true, others: false },
  { feature: 'Single Sign-on', nexcore: true, others: true },
];

export default function Differentiation() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
            Why NexCore is different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop juggling Discord, LinkedIn, and GitHub. Everything in one platform.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-8 py-6 text-left text-foreground font-semibold">Feature</th>
                <th className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-base font-bold text-accent">NexCore</div>
                    <div className="text-xs text-muted-foreground font-normal">All-in-one</div>
                  </div>
                </th>
                <th className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-base font-bold text-foreground">Others</div>
                    <div className="text-xs text-muted-foreground font-normal">Multiple tools</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((item, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-8 py-5 text-foreground font-medium">{item.feature}</td>
                  <td className="px-8 py-5 text-center">
                    {item.nexcore ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/15">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/30">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {item.others ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/15">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/30">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Why context switch when you can have everything in one place?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3.5 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-black/95 transition-colors subtle-hover">
              Start Free Trial
            </button>
            <button className="px-8 py-3.5 rounded-full font-semibold border border-border text-foreground hover:bg-secondary transition-colors subtle-hover">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
