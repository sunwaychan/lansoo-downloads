import React, { useState, useEffect } from 'react';

// 将图片URL改为你引用的站外链接
const banners = [
  { id: 1, url: 'https://img.lansoo.com/file/1756974582770_banner3.png', alt: 'Lansoo' },
  { id: 2, url: 'https://img.lansoo.com/file/1756974575664_banner2.png', alt: 'Stie' },
  { id: 3, url: 'https://img.lansoo.com/file/1756974574144_banner1.png', alt: 'Soft' }
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 设置自动播放，每5秒切换一次
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    // 清除定时器，防止内存泄漏
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner-carousel">
      <div className="carousel-images" style={{ transform: `translateX(${-currentIndex * 100}%)` }}>
        {banners.map((banner) => (
          <img key={banner.id} src={banner.url} alt={banner.alt} className="carousel-image" />
        ))}
      </div>
      <div className="carousel-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
