// app/not-found.js
import Image from 'next/image';
 
export default function NotFound() {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
            <div className="not-found flex items-center justify-center">
                <Image src="/images/404-error.png" alt="404" width={500} height={500} />
            </div>
        </div>
    );
}
  