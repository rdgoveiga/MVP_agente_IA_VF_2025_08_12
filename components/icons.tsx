

import React from 'react';

// Props for any SVG icon component
interface IconProps {
  className?: string;
  solid?: boolean; // For icons with solid/outline variants like StarIcon
}

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const BrainCircuitIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5a3 3 0 1 0-5.993.129"/>
        <path d="M12 5a3 3 0 1 0 5.993.129"/>
        <path d="M15 13a3 3 0 1 0-5.993.129"/>
        <path d="M15 13a3 3 0 1 0 5.993.129"/>
        <path d="M9 13a3 3 0 1 0-5.993.129"/>
        <path d="M6.007 13.129A3 3 0 1 0 9 13"/>
        <path d="M12 18a3 3 0 1 0-5.993.129"/>
        <path d="M12 18a3 3 0 1 0 5.993.129"/>
        <path d="M4.28 14.529a14.12 14.12 0 0 1-1.12-1.54"/>
        <path d="M19.72 14.529a14.12 14.12 0 0 0 1.12-1.54"/>
        <path d="M6.15 7.88A14.12 14.12 0 0 1 5 6.2"/>
        <path d="M17.85 7.88A14.12 14.12 0 0 0 19 6.2"/>
        <path d="M12 5V2"/>
        <path d="M12 21v-3"/>
        <path d="M12 13v2"/>
        <path d="M9 13H6"/>
        <path d="M18 13h-3"/>
        <path d="M9 5H6"/>
        <path d="M18 5h-3"/>
    </svg>
);


export const BuildingOfficeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h.75v3.75a.75.75 0 0 0 1.5 0v-3.75h4.5v3.75a.75.75 0 0 0 1.5 0v-3.75h.75a.75.75 0 0 0 .75-.75V3a.75.75 0 0 0-.75-.75h-10.5ZM15 3a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-4.5Z" clipRule="evenodd" />
        <path d="M16.5 11.25a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-4.5Z" />
    </svg>
);

export const GlobeAltIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.606 4.654a.75.75 0 0 1 .788.058l1.588 1.08a.75.75 0 0 1-.364 1.342l-1.396-.348a2.234 2.234 0 0 0-1.748 1.986l-.085 1.018a.75.75 0 0 1-1.49-.125l.085-1.018a3.843 3.843 0 0 1 2.86-3.268ZM3.75 12a8.25 8.25 0 0 1 3.284-6.556.75.75 0 0 1 1.066 1.06A6.75 6.75 0 0 0 6.75 12a.75.75 0 0 1-1.5 0 8.25 8.25 0 0 1-1.5-6.75ZM12 20.25a8.25 8.25 0 0 1-6.142-2.924.75.75 0 0 1 1.06-1.061 6.75 6.75 0 0 0 10.164 0 .75.75 0 1 1 1.06 1.06A8.25 8.25 0 0 1 12 20.25Z" clipRule="evenodd" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 448 512" fill="currentColor">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 221.9-99.6 221.9-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7-4.1-72.5 19 19.3-71.1-4.5-7.4c-18.5-30.7-29.9-66.5-29.9-104.4 0-107.7 87.5-195.2 195.2-195.2 53 0 102.6 20.5 138.2 56.2 35.5 35.5 56.1 85.1 56.1 138.2 0 107.7-87.5 195.2-195.2 195.2zm101.7-145.3c-3.2-1.6-18.9-9.3-21.8-10.4-2.9-1.1-5.1-1.6-7.2.6-2.1 2.2-8.2 10.4-10.1 12.5-1.9 2.1-3.8 2.3-7 .8-3.2-1.5-13.5-5-25.7-15.9-9.5-8.4-15.9-18.7-17.8-21.8-1.9-3.1-.2-4.8.7-6.3 1.6-1.9 3.5-3.8 5.3-5.6 1.8-1.8 2.3-3.1 3.5-5.1.7-1.1.4-2.1-.2-3.6-1.5-3.6-6.6-15.9-9.1-21.8-2.4-5.8-4.9-5-7-5.1-.6-.1-1.2-.1-1.8-.1-2.1 0-5.6 1.1-8.5 3.8-2.9 2.7-11.1 10.9-11.1 26.6 0 15.7 11.4 30.9 13 33.1 1.6 2.2 22.1 35.4 53.7 47.3 7.8 2.9 14.1 4.7 18.8 6.1 4.7 1.4 8.9 1.2 12.2.8 3.7-.4 11.1-4.5 12.7-8.8 1.6-4.3 1.6-8 .4-9.3z"/>
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.103 3.104-1.593-1.594a.75.75 0 0 0-1.06 1.061l2.122 2.122a.75.75 0 0 0 1.06 0l3.625-3.625Z" clipRule="evenodd" />
    </svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
    </svg>
);

export const ClipboardIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.5 3A2.25 2.25 0 0 0 8.25 5.25v.54l-1.2.3a.75.75 0 0 0-.6 1.03l.23 1.03A2.25 2.25 0 0 0 8.25 10.5h7.5a2.25 2.25 0 0 0 2.24-2.35l.23-1.03a.75.75 0 0 0-.6-1.03l-1.2-.3v-.54A2.25 2.25 0 0 0 13.5 3h-3ZM9.75 5.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v.54a2.25 2.25 0 0 0-1.5-.54h-1.5a2.25 2.25 0 0 0-1.5.54v-.54Z" clipRule="evenodd" />
        <path d="M6 11.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v8.25a.75.75 0 0 1-.75-.75H6.75a.75.75 0 0 1-.75-.75v-8.25Z" />
    </svg>
);

export const ArrowDownTrayIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M5.25 2.25a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 .75.75h3.75a.75.75 0 0 0 0-1.5H6v-12h12v3.75a.75.75 0 0 0 1.5 0V3a.75.75 0 0 0-.75-.75H5.25Zm6.75 11.69a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 1 0-1.06-1.06L13.5 11.69V6a.75.75 0 0 0-1.5 0v5.69l-1.97-1.97a.75.75 0 0 0-1.06 1.06l3.75 3.75Z" clipRule="evenodd" />
      <path d="M19.5 16.5a.75.75 0 0 0-1.5 0v3a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 0-1.5 0v3A2.25 2.25 0 0 0 6.75 22.5h10.5A2.25 2.25 0 0 0 19.5 19.5v-3Z" />
    </svg>
);

export const UserGroupIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 6.375a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Z" />
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5ZM9 6.75A2.25 2.25 0 0 1 11.25 4.5h1.5A2.25 2.25 0 0 1 15 6.75v3.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75V6.75Z" clipRule="evenodd" />
    </svg>
);

export const CircleStackIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

export const CloudArrowUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.14 0-3.483.01-4.694.067-2.618.12-3.877 1.378-3.996 3.996C3.245 8.517 3.235 8.86 3.235 12s.01 3.483.067 4.694c.12 2.618 1.378 3.877 3.996 3.996 1.21.057 1.554.067 4.694.067s3.483-.01 4.694-.067c2.618-.12 3.877-1.378 3.996-3.996.057-1.21.067-1.554.067-4.694s-.01-3.483-.067-4.694c-.12-2.618-1.378-3.877-3.996-3.996C15.483 3.975 15.14 3.965 12 3.965zM12 6.837c-2.843 0-5.163 2.32-5.163 5.163s2.32 5.163 5.163 5.163 5.163-2.32 5.163-5.163-2.32-5.163-5.163-5.163zm0 8.528c-1.856 0-3.363-1.507-3.363-3.363s1.507-3.363 3.363 3.363 3.363 1.507 3.363 3.363-1.507 3.363-3.363 3.363zm4.868-8.204c0 .795-.645 1.44-1.44 1.44s-1.44-.645-1.44-1.44.645-1.44 1.44-1.44 1.44.645 1.44 1.44z" />
    </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 5.162-12.723A6.875 6.875 0 0 0 12 2.25a6.875 6.875 0 0 0-6.875 6.875c0 4.694 2.156 9.16 5.162 12.723ZM12 11.25a2.625 2.625 0 1 1 0-5.25 2.625 2.625 0 0 1 0 5.25Z" clipRule="evenodd" />
    </svg>
);

export const InformationCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
);

export const TagIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 3.75a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75-.75h-9a.75.75 0 0 1-.75-.75v-9zM5.25 4.5v9h9v-9h-9z" clipRule="evenodd" />
    <path d="M10.5 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V9h-3.75a.75.75 0 0 1-.75-.75z" />
  </svg>
);

export const ExclamationTriangleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
);

export const PencilSquareIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
      <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .897 1.203A3.744 3.744 0 0 1 5.26 17.242Z" />
    </svg>
);

export const DocumentDuplicateIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.25 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M11.25 6a3 3 0 0 1 3 3v.035l3.375-.563a.75.75 0 0 1 .82.82l-.563 3.375A3 3 0 0 1 15.035 15H15v1.5a.75.75 0 0 1-1.5 0V15a3 3 0 0 1-3-3V6Z" clipRule="evenodd" />
      <path d="M5.25 2.25A2.25 2.25 0 0 0 3 4.5v13.5A2.25 2.25 0 0 0 5.25 20.25h8.25a.75.75 0 0 1 0 1.5H5.25A3.75 3.75 0 0 1 1.5 18V4.5A3.75 3.75 0 0 1 5.25 0h8.25a.75.75 0 0 1 0 1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h8.25a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3A2.25 2.25 0 0 1 13.5 20.25H5.25A2.25 2.25 0 0 1 3 18V4.5a1.5 1.5 0 0 1 .697-1.246l.003-.001Z" />
    </svg>
);

export const ClipboardDocumentIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.5 3A2.25 2.25 0 0 0 8.25 5.25v.54l-1.2.3a.75.75 0 0 0-.6 1.03l.23 1.03A2.25 2.25 0 0 0 8.25 10.5h7.5a2.25 2.25 0 0 0 2.24-2.35l.23-1.03a.75.75 0 0 0-.6-1.03l-1.2-.3v-.54A2.25 2.25 0 0 0 13.5 3h-3ZM9.75 5.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v.54a2.25 2.25 0 0 0-1.5-.54h-1.5a2.25 2.25 0 0 0-1.5.54v-.54Z" clipRule="evenodd" />
      <path d="M6 11.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v7.5a1.5 1.5 0 0 1-1.5 1.5H7.5a1.5 1.5 0 0 1-1.5-1.5v-7.5Z" />
    </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10z" clipRule="evenodd" />
  </svg>
);

export const ArrowRightOnRectangleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

export const EnvelopeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
);

export const LockClosedIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25a3.75 3.75 0 1 0 7.5 0v3h-7.5v-3Z" clipRule="evenodd" />
    </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
    </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L8.75 5.152A11.249 11.249 0 0 1 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
      <path d="M15.75 12c0 .18-.013.357-.037.53l-2.24 2.24c.557.26.78.881.52 1.438l-.493.493a2.25 2.25 0 0 1-3.182-3.182l.493-.493c.557-.26.88-.781 1.438-.52l2.24-2.24a3.75 3.75 0 0 1 .53.037Z" />
      <path d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75A11.249 11.249 0 0 1 17.5 5.152l-1.662 1.662c-.41.32-.828.595-1.27.81a3.75 3.75 0 0 0-4.665 4.665l-1.99 1.99A11.25 11.25 0 0 1 1.323 11.447Z" />
    </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
    </svg>
);

export const PaperAirplaneIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
  </svg>
);

export const ChatBubbleOvalLeftEllipsisIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM8.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Zm3.75-.75a.75.75 0 0 0-1.5 0v.01a.75.75 0 0 0 1.5 0V12Zm3-1.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

export const XMarkIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M15.75 1.5a3.75 3.75 0 0 0-3.75 3.75v1.5h-1.5a3.75 3.75 0 0 0-3.75 3.75v9.75a3.75 3.75 0 0 0 3.75 3.75h9.75a3.75 3.75 0 0 0 3.75-3.75v-9.75a3.75 3.75 0 0 0-3.75-3.75h-1.5v-1.5A3.75 3.75 0 0 0 15.75 1.5zm-7.5 6a2.25 2.25 0 0 1 2.25-2.25v1.5a.75.75 0 0 0 1.5 0v-1.5a2.25 2.25 0 1 1 4.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5a3.75 3.75 0 1 0-7.5 0v3a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-1.5a2.25 2.25 0 0 1 2.25-2.25h1.5z" clipRule="evenodd" />
  </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.26c-.341.024-.69.058-.998.098l-.396.028a2.25 2.25 0 0 1-2.16-2.003l-.014-.015a2.25 2.25 0 0 1 2.226-2.433l.31-.028c.31-.024.624-.055.924-.086l.51-.039a2.25 2.25 0 0 0 1.956-2.183l-.004-.007a2.25 2.25 0 0 0-2.25-2.25H13.5M4.5 8.511c-.884.284-1.5 1.128-1.5 2.097v4.286c0 1.136.847 2.1 1.98 2.193l3.722.26c.341.024.69.058.998.098l.396.028a2.25 2.25 0 0 0 2.16-2.003l.014-.015a2.25 2.25 0 0 0-2.226-2.433l-.31-.028c-.31-.024-.624-.055-.924-.086l-.51-.039a2.25 2.25 0 0 1-1.956-2.183l.004-.007A2.25 2.25 0 0 1 4.5 8.511Z" />
  </svg>
);

export const QuestionMarkCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

export const FireIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071 1.052A2.25 2.25 0 0 1 12.75 6.75a.75.75 0 0 0 1.5 0a3.75 3.75 0 0 0-2.5-3.502a.75.75 0 0 0-1.052-1.071Zm-3.181 2.808a.75.75 0 0 0-1.052 1.072A4.5 4.5 0 0 1 7.5 10.5a.75.75 0 0 0 1.5 0a3 3 0 0 0-1.722-2.684a.75.75 0 0 0-1.071-1.052Z" clipRule="evenodd" />
    <path d="M5.163 9.32a.75.75 0 0 1 .693 1.341A5.99 5.99 0 0 0 5.25 15.75a.75.75 0 0 1-1.5 0a7.5 7.5 0 0 1 1.413-4.43z" />
    <path fillRule="evenodd" d="M12.75 18a.75.75 0 0 0-1.5 0a5.25 5.25 0 0 1-10.5 0a.75.75 0 0 0-1.5 0a6.75 6.75 0 0 0 13.5 0a.75.75 0 0 0-1.5 0Zm4.364-6.42a.75.75 0 0 1 0-1.06a3.376 3.376 0 0 0 0-4.774a.75.75 0 0 1-1.06-1.06a4.876 4.876 0 0 1 0 6.894a.75.75 0 0 1 0 1.061Zm2.121-2.122a.75.75 0 0 0 0 1.061a1.876 1.876 0 0 1 0 2.652a.75.75 0 0 0 1.06 1.06a3.376 3.376 0 0 0 0-4.774a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.5 1.5A5.25 5.25 0 0 0 5.25 6.75v1.5a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h1.5a.75.75 0 0 0 0-1.5H6.75a1.5 1.5 0 0 1-1.5-1.5v-3.75a.75.75 0 0 0 .75-.75V6.75a3.75 3.75 0 0 1 3.75-3.75h1.5a3.75 3.75 0 0 1 3.75 3.75v1.5a.75.75 0 0 0 1.5 0v-1.5A5.25 5.25 0 0 0 13.5 1.5h-3Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M8.25 15a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V15.75a.75.75 0 0 1 .75-.75Zm3.75 0a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V15.75a.75.75 0 0 1 .75-.75Zm3.75 0a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V15.75a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M8.38 8.018a.75.75 0 0 1 .67-.418h5.9a.75.75 0 0 1 .67.418l2.25 5.25a.75.75 0 0 1-.67 1.082H6.78a.75.75 0 0 1-.67-1.082l2.25-5.25Z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 0 8.59V13.5a.75.75 0 0 1-1.5 0V4.478a.75.75 0 0 1 1.5 0ZM8.25 4.478v.227a48.817 4.8817 0 0 0 0 8.59V13.5a.75.75 0 0 0-1.5 0V4.478a.75.75 0 0 0 1.5 0Z" clipRule="evenodd" />
      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 2.25a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 0 1.5 0V2.25ZM16.5 2.25a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 0 1.5 0V2.25Z" />
      <path fillRule="evenodd" d="M5.05 21.75a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75h13.9a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75H5.05ZM9 12a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H9.75A.75.75 0 0 1 9 12Z" clipRule="evenodd" />
    </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className, solid }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={solid ? "currentColor" : "none"} className={className} stroke={solid ? "none" : "currentColor"} strokeWidth="1.5">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
);

export const LightBulbIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-3.065 0-5.64.99-7.532 2.583a.75.75 0 0 0-.012 1.062l.012.012a.75.75 0 0 0 1.062-.012A5.855 5.855 0 0 1 12 4.5c2.193 0 4.14 1.11 5.468 2.883a.75.75 0 0 0 1.074-1.05A8.151 8.151 0 0 0 12 2.25Z" clipRule="evenodd" />
      <path d="M9.813 9.45a.75.75 0 0 1 .922-.626l.73.243a.75.75 0 0 1 .626.922l-.243.73a.75.75 0 0 1-.922.626l-.73-.243a.75.75 0 0 1-.626-.922l.243-.73ZM13.5 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008ZM10.5 12a.75.75 0 0 1 .75-.75H11.25a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" />
      <path fillRule="evenodd" d="M12 7.5a4.5 4.5 0 0 0-4.5 4.5v3.153a2.25 2.25 0 0 0 1.226 2.01l.71 3.55A.75.75 0 0 0 10.2 21.75h3.6a.75.75 0 0 0 .714-.537l.71-3.55a2.25 2.25 0 0 0 1.226-2.01V12A4.5 4.5 0 0 0 12 7.5Zm-2.999 4.5a3 3 0 0 1 3-3V15a3 3 0 0 1-3-3Z" clipRule="evenodd" />
    </svg>
);