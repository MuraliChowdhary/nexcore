'use client';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-32 bg-white">
      {/* Announcement Badge */}
      <div className="mb-8 inline-block animate-fade-in">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-foreground elegant-shadow">
          <span className="flex h-2 w-2 rounded-full bg-accent"></span>
          New: Smart project matching is live
        </div>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-center text-foreground leading-snug text-balance max-w-5xl mb-6 animate-fade-in tracking-tight">
        Find your team. Build your idea.
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-lg text-muted-foreground text-center max-w-2xl mb-12 leading-relaxed animate-fade-in font-normal">
        One platform for developers to discover collaborators,
manage projects, and communicate in real-time.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24 animate-fade-in">
        <button className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-black/95 transition-colors subtle-hover">
          Get Started
        </button>
        <button className="px-8 py-3.5 bg-secondary text-foreground font-semibold rounded-full border border-border hover:bg-muted transition-colors subtle-hover">
          View Demo
        </button>
      </div>

      {/* Mac Laptop Dashboard Preview */}
      <div className="w-full max-w-6xl animate-fade-in">
        <div className="relative">
          {/* MacBook Screen - Light theme with minimal aluminum frame */}
          <div className="bg-white rounded-3xl border-8 border-gray-300/40 overflow-hidden elegant-shadow">
            {/* macOS Top Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-secondary border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs font-medium text-muted-foreground">nexcore.app/workspace</span>
              <div className="w-12"></div>
            </div>

            {/* Dashboard Content */}
            <div className="flex h-96 bg-white">
              {/* Left Sidebar - Channels */}
              <div className="w-56 border-r border-border bg-secondary/40 px-4 py-6">
                <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wide">Channels</h4>
                <div className="space-y-2">
                  <div className="px-3 py-2 rounded text-sm text-accent font-medium bg-accent/10">
                    # general
                  </div>
                  <div className="px-3 py-2 rounded text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                    # frontend
                  </div>
                  <div className="px-3 py-2 rounded text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                    # design
                  </div>
                </div>

                <h4 className="text-xs font-bold text-muted-foreground mt-6 mb-4 uppercase tracking-wide">Team</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-foreground">Alex K.</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-sm text-foreground">Sarah M.</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-foreground">James L.</span>
                  </div>
                </div>
              </div>

              {/* Center - Chat/Messages */}
              <div className="flex-1 border-r border-border flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                      A
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">Alex K.</span>
                        <span className="text-xs text-muted-foreground">2m ago</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">Just pushed the new auth flow. Can someone review?</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold text-blue-600">
                      S
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">Sarah M.</span>
                        <span className="text-xs text-muted-foreground">1m ago</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">On it! The design looks solid 🎨</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-xs font-semibold text-purple-600">
                      J
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">James L.</span>
                        <span className="text-xs text-muted-foreground">30s ago</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">I'll handle the API integration. Let's ship this today.</p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="px-6 py-4 border-t border-border">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full text-sm px-4 py-2 bg-secondary border border-border rounded-full outline-none focus:ring-1 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Right Sidebar - Tasks */}
              <div className="w-48 border-l border-border bg-secondary/40 px-4 py-6 overflow-y-auto">
                <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wide">Tasks</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded border-2 border-green-500 mt-0.5 flex items-center justify-center bg-green-50">
                      <span className="text-xs text-green-600">✓</span>
                    </div>
                    <span className="text-foreground line-through text-gray-500">Auth flow UI</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded border-2 border-accent mt-0.5"></div>
                    <span className="text-foreground">API integration</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded border-2 border-border mt-0.5"></div>
                    <span className="text-foreground">Unit tests</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded border-2 border-border mt-0.5"></div>
                    <span className="text-foreground">Deploy staging</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-muted-foreground mt-6 mb-3 uppercase tracking-wide">Sprint Progress</h4>
                <div className="space-y-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-accent rounded-full"></div>
                  </div>
                  <p className="text-xs text-muted-foreground">2/4 completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Bottom Bezel */}
          <div className="flex justify-center mt-0">
            <div className="w-2/3 h-2 bg-gray-300/40 rounded-b-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
