'use client';

import { Search, Users, MessageSquare, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Smart Project Discovery',
    description: 'Find innovative projects that match your skills and interests with our intelligent matching.',
  },
  {
    icon: Users,
    title: 'Find Teammates by Skills',
    description: 'Connect with developers who have exactly what you need. Build diverse teams instantly.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Collaboration',
    description: 'Chat, share ideas, and communicate seamlessly in one unified workspace.',
  },
  {
    icon: CheckCircle,
    title: 'Project Management',
    description: 'Manage tasks, track progress, and coordinate work all in one place.',
  },
];

export default function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
            Everything you need to collaborate and ship
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for modern development teams.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group p-7 rounded-2xl border border-border bg-secondary hover:border-foreground/20 transition-all duration-300 subtle-hover"
              >
                {/* Icon */}
                <div className="mb-5 inline-block p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
