# Zot!
Zot :cloud_with_lightning: A JS multi media player

## ⭐️ Feature

- Clappr
- Flickity

## 📦 Getting Started to Develop

```
git clone https://github.com/geckoslair/zot myLibrary
yarn
```


## 🚀 How to use it

### Video element
```
var elem = document.getElementById("zot-video");
new Zot('video', elem, {source: "http://techslides.com/demos/sample-videos/small.mp4"});
```

### Audio element
```
var elemGallery = document.getElementById("zot-gallery");
new Zot('gallery', elemGallery, {lazyLoad: 1, source: ["https://fillmurray.com/460/300", "https://fillmurray.com/460/300"]});
```

### Gallery element
```
var elemAudio = document.getElementById("zot-audio");
new Zot('audio', elemAudio, {source: "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_5MG.mp3", audioOnly: true});
```
