import { apiGet, apiPost, apiPut } from '@/lib/api';
import { OneDriveFile, OneDriveSync, ApiResponse } from '@/types';

export const onedriveService = {
  // Get OneDrive connection status
  getConnectionStatus: (): Promise<ApiResponse<{
    connected: boolean;
    user?: string;
    lastSync?: string;
    totalFiles?: number;
  }>> => {
    return apiGet('/onedrive/status');
  },

  // Initiate OAuth connection
  connect: (): Promise<ApiResponse<{ authUrl: string }>> => {
    return apiPost('/onedrive/connect');
  },

  // Complete OAuth flow
  completeAuth: (code: string): Promise<ApiResponse<{ success: boolean; user: string }>> => {
    return apiPost('/onedrive/auth/complete', { code });
  },

  // Disconnect OneDrive
  disconnect: (): Promise<ApiResponse<void>> => {
    return apiPost('/onedrive/disconnect');
  },

  // Get OneDrive files
  getFiles: (path?: string, type?: string): Promise<ApiResponse<OneDriveFile[]>> => {
    const params: any = {};
    if (path) params.path = path;
    if (type) params.type = type;
    return apiGet<OneDriveFile[]>('/onedrive/files', params);
  },

  // Start sync process
  startSync: (path?: string, syncNFsOnly?: boolean): Promise<ApiResponse<OneDriveSync>> => {
    return apiPost<OneDriveSync>('/onedrive/sync/start', { 
      path, 
      nfs_only: syncNFsOnly 
    });
  },

  // Get sync status
  getSyncStatus: (syncId: number): Promise<ApiResponse<OneDriveSync>> => {
    return apiGet<OneDriveSync>(`/onedrive/sync/${syncId}`);
  },

  // Get sync history
  getSyncHistory: (): Promise<ApiResponse<OneDriveSync[]>> => {
    return apiGet<OneDriveSync[]>('/onedrive/sync/history');
  },

  // Cancel ongoing sync
  cancelSync: (syncId: number): Promise<ApiResponse<void>> => {
    return apiPost(`/onedrive/sync/${syncId}/cancel`);
  },

  // Configure sync settings
  configureSyncSettings: (settings: {
    autoSync?: boolean;
    syncInterval?: number; // minutes
    syncPath?: string;
    nfsOnly?: boolean;
    notifyOnSync?: boolean;
  }): Promise<ApiResponse<void>> => {
    return apiPut('/onedrive/sync/settings', settings);
  },

  // Get sync settings
  getSyncSettings: (): Promise<ApiResponse<{
    autoSync: boolean;
    syncInterval: number;
    syncPath: string;
    nfsOnly: boolean;
    notifyOnSync: boolean;
  }>> => {
    return apiGet('/onedrive/sync/settings');
  },

  // Download file from OneDrive
  downloadFile: (fileId: string, localPath?: string): Promise<ApiResponse<{ success: boolean; path: string }>> => {
    return apiPost('/onedrive/files/download', { file_id: fileId, local_path: localPath });
  },

  // Upload file to OneDrive
  uploadFile: (localPath: string, onedrivePath?: string): Promise<ApiResponse<OneDriveFile>> => {
    return apiPost<OneDriveFile>('/onedrive/files/upload', { 
      local_path: localPath, 
      onedrive_path: onedrivePath 
    });
  }
};