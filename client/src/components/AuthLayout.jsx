import LoginNavigation from './LoginNavigation';
import "../styles/AuthLayout.css";

export default function AuthLayout({ children, headerCentered = false, showSideDecor = false, sideImageLeft, sideImageRight, backgroundImage, backgroundSize = 'cover', backgroundPosition = 'center' }) {
  return (
    <div className="auth-layout min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="auth-layout__header">
        <LoginNavigation center={headerCentered} />
      </div>

      {/* Main content */}
      <main className="auth-layout__main flex-1">
        {backgroundImage && (
          <div
            className="auth-bg"
            style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize, backgroundPosition }}
            aria-hidden="true"
          />
        )}
        {showSideDecor && (
          <>
            <div className="auth-decor auth-decor--left" aria-hidden="true" />
            <div className="auth-decor auth-decor--right" aria-hidden="true" />
          </>
        )}
        {sideImageLeft && (
          <img src={sideImageLeft} alt="" aria-hidden="true" className="auth-decor-img auth-decor-img--left" />
        )}
        {sideImageRight && (
          <img src={sideImageRight} alt="" aria-hidden="true" className="auth-decor-img auth-decor-img--right" />
        )}
        <div className="auth-layout__container max-w-md mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-layout__footer">
        <div className="auth-layout__footer-inner max-w-7xl mx-auto px-4 py-6 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Pet Care Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
