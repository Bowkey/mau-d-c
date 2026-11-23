import Link from "next/link";

export default function StorefrontFooter() {
  return (
    <footer id="footer">
      <Link className="brand footer-brand" href="/">MAU<span>DESIGNS</span></Link>
      <p>Colorful fabrics, thoughtful making, and style with heart.</p>
      <div className="footer-links"><a href="#">Instagram</a><a href="#">WhatsApp</a><a href="#">Contact</a><Link href="/admin">Admin</Link></div>
    </footer>
  );
}
