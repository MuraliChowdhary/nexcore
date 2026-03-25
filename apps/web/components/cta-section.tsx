'use client';

import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Heading */}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground text-balance">
          Ready to build something amazing?
        </h2>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of developers collaborating on NexCore. Start building today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-black/95 transition-colors subtle-hover">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3.5 rounded-full font-semibold border border-border text-foreground hover:bg-secondary transition-colors subtle-hover">
            Schedule Demo
          </button>
        </div>

        {/* Social Proof */}
        {/* <div className="pt-12 border-t border-border">
          <p className="text-sm text-muted-foreground mb-6">Trusted by developers at leading companies</p>
          <div className="flex flex-wrap gap-6 justify-center items-center">
            {['Microsoft', 'Google', 'Meta', 'Stripe', 'Vercel'].map((company) => (
              <span key={company} className="text-sm font-medium text-muted-foreground">
                {company}
              </span>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
