import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        Fam<span className="text-pink-500">❤</span>ly<span className="text-pink-500">❤</span>ng
      </Link>
      <nav className="flex gap-4 items-center">
        <Link href="/about">About</Link>
        <Link href="/features">Features</Link>
        <Link href="/book-summaries">Book Summaries</Link>
        <Link href="/subscribe">Subscribe</Link>
        <Link href="/sign-in">Log In</Link>
      </nav>
      <Button asChild>
        <Link href="/quiz">Start My Quiz</Link>
      </Button>
    </header>
  );
};

export default Navbar;
