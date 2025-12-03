"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, useGetMeQuery, useLogoutMutation } from "@/redux/features/auth/auth.api";
import { useAppDispatch } from "@/redux/hooks";

export function NavbarDemo() {
  const navItems = [
    {
      name: "Home",
      link: "#home",
    },
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Skills",
      link: "#skills",
    },
    {
      name: "Projects",
      link: "#projects",
    },
    {
      name: "Blogs",
      link: "#blog",
    },
    {
      name: "Experience",
      link: "#experience",
    },
  ];
  const resumeLink =
    "https://drive.google.com/file/d/1lBFZMJNUV-LiDfDIhm9ghs3sffHSakgz/view?usp=sharing";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string
  ) => {
    e.preventDefault();

    if (window.location.pathname.startsWith("/blogs")) {
      router.push(`/${link}`);
      setIsMobileMenuOpen(false);
      return;
    }

    const targetId = link.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const {data: me} = useGetMeQuery(undefined)
  const [logout] = useLogoutMutation()
  const dispatch = useAppDispatch()

  const router = useRouter();

  const handleLogout = async()=>{
    await logout(undefined)
    dispatch(authApi.util.resetApiState())
  }

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} onItemClick={handleNavClick} />
          <div className="flex items-center gap-4">
            {me ? (
              <>
                <NavbarButton href="/dashboard" variant="secondary">
                  Dashboard
                </NavbarButton>
                <NavbarButton
                  onClick={() => handleLogout()}
                  variant="secondary"
                >
                  Logout
                </NavbarButton>
              </>
            ) : (
              <NavbarButton href="/login" variant="secondary">
                Login
              </NavbarButton>
            )}

            <NavbarButton target="_blank" href={resumeLink} variant="primary">
              My Resume
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => handleNavClick(e, item.link)}
                className="relative text-white"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {me ? (
                <>
                  <NavbarButton href="/dashboard" variant="secondary">
                    Dashboard
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => handleLogout()}
                    variant="secondary"
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <NavbarButton href="/login" variant="secondary">
                  Login
                </NavbarButton>
              )}
              <NavbarButton target="_blank" href={resumeLink} variant="primary">
                My Resume
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
