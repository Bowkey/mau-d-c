This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Admin and product setup

The admin dashboard at `/admin` creates product posts in Firebase Firestore and publishes optional product images to Cloudinary. A post includes a name, description, price in naira, category, and up to five photos. Drafts remain hidden from the shop until published. **Styles**, **Fabrics**, **Sewing accessories**, **Sewing machine parts**, and **Services** have dedicated pages; the **Shop sections** panel controls which product categories and individual services are available in the navigation. All sections are available by default. The admin can also update the WhatsApp contact number and the CEO profile shown on the homepage, including its Cloudinary portrait.

1. Copy `.env.example` to `.env.local`.
2. In Firebase, create a project and enable **Cloud Firestore**. Create a service account with access to Firestore and add its project ID, service-account email, and private key to `.env.local`. Keep the private key on the server; never use a `NEXT_PUBLIC_` prefix for Firebase Admin credentials.
3. In Cloudinary, find the cloud name, API key, and API secret in the dashboard and add them to `.env.local`. The API secret is used only by the server to sign image uploads.
4. Set a long, unique `ADMIN_PASSWORD` and an `ADMIN_SESSION_SECRET` with at least 32 characters. Keep `.env.local` private and configure the same values as secrets in your hosting provider when deploying.
5. Run `npm run dev`, then open `http://localhost:3000/admin` to sign in and create products.

Firebase Admin accesses Firestore only from the server. Do not expose the service-account key or Cloudinary API secret in browser code.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
