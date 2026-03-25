'use client';

import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create or Discover',
    description: 'Start a new project or browse ideas from developers looking for collaborators.',
  },
  {
    number: '02',
    title: 'Find Your Team',
    description: 'Discover developers with complementary skills and shared vision.',
  },
  {
    number: '03',
    title: 'Collaborate & Ship',
    description: 'Work together in real-time with integrated tools and build amazing projects.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
            Get started in three simple steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to launch, NexCore streamlines collaborative development.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Card */}
              <div className="relative p-8 rounded-2xl border border-border bg-secondary hover:bg-muted/30 transition-all duration-300 subtle-hover h-full">
                {/* Step Number */}
                <div className="text-6xl font-bold text-muted/40 mb-6">
                  {step.number}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{step.description}</p>
              </div>

              {/* Connector Line */}
              {idx !== steps.length - 1 && (
                <div className="hidden lg:block absolute -right-8 top-1/4 w-16 h-px bg-border"></div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-black/95 transition-colors subtle-hover">
            Start Building Today
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
