import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  heroContent: ReactNode;
};

export default function AuthLayout({ children, heroContent }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full grid md:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      
      <div className="hidden md:flex bg-primary items-center justify-center">
        <div className="max-w-md p-10 text-white">
          {heroContent}
        </div>
      </div>
    </div>
  );
}
