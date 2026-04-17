Cloudinary setup (quick)

1. Create a free Cloudinary account: https://cloudinary.com/
2. Get your credentials (Cloud name, API key, API secret). The Cloudinary dashboard shows a URL like:

   cloudinary://API_KEY:API_SECRET@CLOUD_NAME

3. Add to your production environment (on Render, Railway, AWS/GCP) as env var:

   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

4. If running locally with docker-compose, add to `backend/.env.local`:

   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

5. Deploy/restart. Django will automatically use Cloudinary as the media storage backend when `CLOUDINARY_URL` is set.

6. Migrating existing media (local -> Cloudinary)

   There's no built-in automated migration. Suggested approach:
   - Write a simple management command to iterate `FileField`/`ImageField` files and re-save them so storage backend uploads to Cloudinary.
   - Or re-upload via a script that uses the Cloudinary Python SDK to upload files and update model `image` fields with returned URLs.

Example migrate script (run inside project):

```py
# scripts/upload_media_to_cloudinary.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.conf import settings
from apps.products.models import ProductImage

for pi in ProductImage.objects.all():
    if pi.image and not pi.image.url.startswith('http'):
        # re-save file to trigger storage upload
        f = pi.image
        pi.image = f
        pi.save()
        print('Uploaded', pi.pk)
```

Run:
```
python scripts/upload_media_to_cloudinary.py
```

Notes
- Cloudinary has a generous free tier but limits storage/transformations. Monitor usage.
- Ensure you do not commit `CLOUDINARY_URL` to git; use env vars on the host.
