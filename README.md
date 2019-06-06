# Image Collection Visualizer

Visualizing [AMNH](https://www.amnh.org/)'s [Photographic Collection](http://lbry-web-007.amnh.org/digital/collections/show/2) with machine learning and [Library](https://www.amnh.org/research/research-library) metadata.

## Requirements

- [Python](https://www.python.org/) (This is developed using 3.6, so 3.6+ is recommended and may not work with 2.7+)
- [SciPy](https://www.scipy.org/) for math functions (probably already installed)
- [Keras](https://keras.io/) for image feature extraction
- [Scikit-learn](https://scikit-learn.org/stable/) for feature reduction (e.g. PCA)
- [Multicore-TSNE](https://github.com/DmitryUlyanov/Multicore-TSNE) for converting features to 2 dimensions via [TSNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding)
- [RasterFairy](https://github.com/Quasimondo/RasterFairy) for transforming 2D points to grid
- [Pillow](https://pillow.readthedocs.io/en/stable/) for image tile generation
- [Node.js](https://nodejs.org/en/) if you'd like to run the interface locally

## Workflow

First, given a directory of images, we will extract 4096 features using Keras and the [VGG16 model](https://keras.io/applications/#vgg16) with weights pre-trained on [ImageNet](http://www.image-net.org/), then reduce those to 256 features using [PCA](https://en.wikipedia.org/wiki/Principal_component_analysis), then save those features to a compressed file:

```
python images_to_features.py \
-in "images/photographic_thumbnails/*.jpg" \
-pca 256 \
-out "output/photographic_features.p.bz2"
```

Then we will reduce those features even further to just two dimensions using [TSNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding) and output the result to a csv file. You can speed this up by indicated the number of parallel jobs to run, e.g. `-jobs 4`

```
python features_to_tsne.py \
-in "output/photographic_features.p.bz2" \
-jobs 4 \
-out "data/photographic_tsne.csv"
```

Then we will convert those 2D points to a grid assignment using [RasterFairy](https://github.com/Quasimondo/RasterFairy).  Note that Rasterfairy only supports Python 2.x as of this writing.

```
python tsne_to_grid.py \
-in "data/photographic_tsne.csv" \
-out "data/photographic_grid.csv"
```

We will then generate a giant image matrix from the images and the grid data using a 128x128 tile size and 114x116 target grid size:

```
python grid_to_image.py \
-in "data/photographic_grid.csv" \
-tile "128x128" \
-grid "114x116" \
-out "output/photographic_matrix.jpg"
```

Finally, we will convert the giant image to tiles (in .dzi format):

```
python image_to_tiles.py \
-in "output/photographic_matrix.jpg" \
-tsize 128 \
-out "img/photographic_matrix.dzi"
```

If you have metadata and subjects in .csv format like [this file](https://github.com/amnh-sciviz/image-collection/blob/master/data/photographic_images.csv) and [this file](https://github.com/amnh-sciviz/image-collection/blob/master/data/photographic_subjects.csv), you can convert it to .json for it to be used by the interface. Note the `id` column must match the associated image filename (without extension). The grid data and grid size is also indicated so the metadata would align properly:

```
python csv_to_json.py \
-in "data/photographic_images.csv" \
-sub "data/photographic_subjects.csv" \
-image "images/photographic_thumbnails/*.jpg" \
-grid "data/photographic_grid.csv" \
-gsize "114x116"
-out "data/photographic_images.json"
```

You can view the result on a local server by running:

```
npm install
npm start
```
