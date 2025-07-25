
/**
 * GoogleDriveService handles file storage in a configured Drive folder.
 * It provides methods to add, retrieve, and delete files.
 */
class GoogleDriveService {
  constructor(config) {
    this.folderId = config?.imageFolderId;
    if (!this.folderId) throw new Error('Missing imageFolderId in config.');
    this.folder = DriveApp.getFolderById(this.folderId);
  }

  /**
   * Uploads a file blob to Drive and returns a DriveFile instance.
   * @param {Blob} blob - The file blob to upload
   * @returns {DriveFile}
   */
  add(blob) {
    const file = this.folder.createFile(blob);
//    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return new DriveFile({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      url: file.getUrl()
    });
  }

  /**
   * Retrieves a DriveFile by ID.
   * @param {string} id
   * @returns {DriveFile}
   */
  get(id) {
    const file = DriveApp.getFileById(id);
    return new DriveFile({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      url: file.getUrl()
    });
  }

  /**
   * Deletes a file by ID.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    try {
      const file = DriveApp.getFileById(id);
      file.setTrashed(true);
      return true;
    } catch (e) {
      console.warn(`Failed to delete file: ${e.message}`);
      return false;
    }
  }
}
