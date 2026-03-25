'use client';

import { MessageCircle, CheckSquare, Share2 } from 'lucide-react';

export default function CollaborationPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
            Real-time collaboration without friction
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Communicate, coordinate, and create together. All your tools in one seamless workspace.
          </p>
        </div>

        {/* Preview Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Chat Interface */}
          <div>
            <div className="rounded-2xl border border-border bg-white overflow-hidden elegant-shadow">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-accent"></div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Project Team</p>
                    <p className="text-xs text-muted-foreground">3 members active</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-colors"></div>
                  <div className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-colors"></div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 bg-white">
                {/* Message 1 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground mb-1">Alex Chen</p>
                    <div className="bg-secondary rounded-lg p-3 text-sm text-foreground border border-border">
                      <p>Just finished the API integration for authentication</p>
                    </div>
                  </div>
                </div>

                {/* Message 2 */}
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-xs">
                    <p className="text-xs font-medium text-foreground mb-1 text-right">You</p>
                    <div className="bg-accent/15 rounded-lg p-3 text-sm text-foreground border border-accent/30 ml-auto">
                      <p>Awesome! Ready to deploy to staging?</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0"></div>
                </div>

                {/* Message 3 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground mb-1">Jordan Lee</p>
                    <div className="bg-secondary rounded-lg p-3 text-sm text-foreground border border-border">
                      <p>Tests passing on my end. Let's go!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-border bg-secondary flex gap-3">
                <input
                  type="text"
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-white border border-border rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground transition-all subtle-hover"
                />
                <button className="p-2 rounded-full hover:bg-white transition-colors">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-5">
            <div className="p-6 rounded-2xl border border-border bg-white hover:border-foreground/20 transition-all subtle-hover">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Instant Messaging</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time chat with your team. Share ideas, feedback, and decisions instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-white hover:border-foreground/20 transition-all subtle-hover">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <CheckSquare className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Task Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Organize work, assign tasks, and track progress. Keep everyone aligned.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-white hover:border-foreground/20 transition-all subtle-hover">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Share2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">File Sharing</h4>
                  <p className="text-sm text-muted-foreground">
                    Share code, designs, and docs seamlessly with your entire team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
