import React from 'react';

// 转义正则字符，避免输入特殊符号报错
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 高亮关键词
const highlightText = (text, query) => {
  if (!query) return text;
  const safeQuery = escapeRegExp(query);
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part
      )}
    </>
  );
};

// SVG 下载图标
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M12 2.25a.75.75 0 01.75.75v11.69l3.245-3.245a.75.75 0 011.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.245 3.245V3a.75.75 0 01.75-.75zM6 17.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

const SoftwareCard = ({ software, query }) => {
  return (
    <div className="card">
      <h3>{highlightText(software.name, query)}</h3>
      <p>{highlightText(software.description, query)}</p>
      <p className="update-time">更新时间：{software.updatedAt}</p>
      <a
        className="download"
        href={software.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <DownloadIcon />
      </a>
    </div>
  );
};

export default SoftwareCard;
