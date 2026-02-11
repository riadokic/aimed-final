"use client";

import { Component, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-lg py-16">
          <Card className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
              <svg className="h-7 w-7 text-aimed-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-aimed-black">
                {this.props.fallbackTitle ?? "Došlo je do greške"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-aimed-gray-500 max-w-sm">
                {this.props.fallbackDescription ??
                  "Nešto je pošlo po krivu. Pokušajte ponovo ili osvježite stranicu."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Osvježi stranicu
              </Button>
              <Button onClick={this.handleReset}>Pokušaj ponovo</Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
