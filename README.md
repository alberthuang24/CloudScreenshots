# 云截图器
运用node.js 制作的云截图器。
截图像素可达2560
dpi 高达 300
# 安装
git clone https://github.com/HongjiangHuang/CloudScreenshots.git

npm install
#macos
brew install imagemagick
brew install graphicsmagick
###### If you want WebP support with ImageMagick, you must add the WebP option:
brew install imagemagick --with-webp

#centos
yum install ImageMagick-devel
yum install GraphicsMagick-devel

#ubuntu
apt-get install ImageMagick-dev
apt-get install GraphicsMagick-dev

#socket.js
node socket.js 8000
