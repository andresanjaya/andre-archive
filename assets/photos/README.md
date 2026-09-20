Place approved gallery photos here as `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` files. Use descriptive filenames for accessibility; filenames are not displayed as captions in the gallery.

`npm run dev` watches this folder and updates the gallery when photos are added or removed. `npm run build` syncs the folder before creating the static site; deployed sites need a new build and deployment to show later additions. You can also run `npm run sync:photos` manually. Photos are copied into the public site, so remove private location metadata and confirm consent before adding them.
