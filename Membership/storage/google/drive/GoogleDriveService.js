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
   * Uploads an image to Drive from a Base64 string and returns a DriveFile instance.
   * @param {string} base64Image - The Base64 string of the image
   * @param {string} defaultName - The default name for the image file
   * @returns {DriveFile}
   */
  addImage(base64Image, defaultName = 'event-image.png') {
    const base64Data = base64Image.split(',')[1];
    const contentType = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)[1];

    // Generate a random name for the image file
    const randomName = `${defaultName}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;

    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, randomName);
    return this.add(blob); // Use the existing add() method to upload the file
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
