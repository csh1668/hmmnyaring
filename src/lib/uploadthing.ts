/**
 * Uploadthing 클라이언트 유틸리티
 * 
 * 이미지 업로드를 위한 클라이언트 훅과 컴포넌트
 */

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

/**
 * 업로드 버튼 컴포넌트
 * 
 * @example
 * <UploadButton
 *   endpoint="imageUploader"
 *   onClientUploadComplete={(res) => console.log("Files: ", res)}
 *   onUploadError={(error) => alert(error.message)}
 * />
 */
export const UploadButton = generateUploadButton<OurFileRouter>();

/**
 * 드래그 앤 드롭 컴포넌트
 * 
 * @example
 * <UploadDropzone
 *   endpoint="imageUploader"
 *   onClientUploadComplete={(res) => console.log("Files: ", res)}
 *   onUploadError={(error) => alert(error.message)}
 * />
 */
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

/**
 * 커스텀 업로드 훅
 * 
 * @example
 * const { startUpload, isUploading } = useUploadThing("imageUploader");
 */
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

