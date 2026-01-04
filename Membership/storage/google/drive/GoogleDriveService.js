/**
 * GoogleDriveService handles file storage in a configured Drive folder.
 * It provides methods to add, retrieve, and delete files.
 */
class GoogleDriveService {
  constructor(config) {
    this.folderId = config?.imageFolderId;
    if (!this.folderId) throw new Error('Missing imageFolderId in config.');
    this.folder = DriveApp.getFolderById(this.folderId);

    // Root folder for per-event subfolders (optional; falls back to imageFolderId)
    this.eventsRootFolderId = config?.eventsRootFolderId || this.folderId;
    this.eventsRootFolder = DriveApp.getFolderById(this.eventsRootFolderId);
  }

  // --- Generic file methods (unchanged) ---
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

  getAll(folderId = null) {
    const targetFolder = folderId ? DriveApp.getFolderById(folderId) : this.folder;
    const files = [];
    const fileIterator = targetFolder.getFiles();
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      files.push(new DriveFile({
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        url: file.getUrl()
      }));
    }
    return files;
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

  // --- Event image management (new) ---

  ensureEventFolder(calendarId, eventId, eventTitle) {
    const evt = Calendar.Events.get(calendarId, eventId);
    const existingId = evt.extendedProperties?.private?.eventFolderId;
    if (existingId) {
      try {
        DriveApp.getFolderById(existingId);
        return existingId;
      } catch (_) {
        // recreate
      }
    }
    const safeTitle = String(eventTitle || '').replace(/[^\w\d-_ ]+/g, '').substring(0, 40).trim() || 'event';
    const folder = this.eventsRootFolder.createFolder(`${eventId}_${safeTitle}`);
    Calendar.Events.patch({
      extendedProperties: { private: { eventFolderId: folder.getId() } }
    }, calendarId, eventId);
    return folder.getId();
  }

  getEventFolderId(calendarId, eventId) {
    try {
      const evt = Calendar.Events.get(calendarId, eventId);
      return evt.extendedProperties?.private?.eventFolderId || null;
    } catch {
      return null;
    }
  }

  listEventImages(calendarId, eventId) {
    const folderId = this.getEventFolderId(calendarId, eventId);
    if (!folderId) return [];
    let folder;
    try { folder = DriveApp.getFolderById(folderId); } catch { return []; }

    const files = folder.getFiles();
    const images = [];
    while (files.hasNext()) {
      const f = files.next();
      const mime = f.getMimeType();
      if (!/^image\//.test(mime)) continue;

      const name = f.getName();
      let order = 9999;
      let caption = name;
      const m = name.match(/^(\d{1,3})_(.+)$/);
      if (m) {
        order = parseInt(m[1], 10);
        caption = m[2].replace(/\.[^.]+$/, '');
      } else {
        caption = caption.replace(/\.[^.]+$/, '');
      }
      const id = f.getId();
      images.push({
        id,
        order,
        caption,
        name,
        mimeType: mime,
        thumbnailUrl: `https://drive.google.com/thumbnail?&id=${id}`,
        url: `https://drive.google.com/uc?export=view&id=${id}`,
        webViewLink: `https://drive.google.com/file/d/${id}/view`
      });
    }
    images.sort((a, b) => a.order - b.order);
    return images;
  }

  addEventImage(calendarId, eventId, imageArg, caption) {
    // Ensure folder
    const evt = Calendar.Events.get(calendarId, eventId);
    const folderId = this.ensureEventFolder(calendarId, eventId, evt.summary);
    const folder = DriveApp.getFolderById(folderId);

    // Existing file id
    if (typeof imageArg === 'string' && /^[A-Za-z0-9_-]+$/.test(imageArg)) {
      const existingFile = DriveApp.getFileById(imageArg);
      folder.addFile(existingFile);
      return this.listEventImages(calendarId, eventId);
    }

    // Base64 or bytes object
    let blob;
    if (imageArg?.base64) {
      const base64Data = imageArg.base64.split(',')[1] || imageArg.base64;
      const mimeType = imageArg.mimeType || 'image/jpeg';
      const baseName = (caption || imageArg.name || 'image').replace(/[^\w\d-_ ]+/g, '').substring(0, 40);
      const current = this.listEventImages(calendarId, eventId);
      const nextOrder = current.length + 1;
      const fileName = `${String(nextOrder).padStart(2, '0')}_${baseName}.jpg`;
      blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
    } else if (imageArg?.bytes) {
      const mimeType = imageArg.mimeType || 'image/jpeg';
      const baseName = (caption || imageArg.name || 'image').replace(/[^\w\d-_ ]+/g, '').substring(0, 40);
      const current = this.listEventImages(calendarId, eventId);
      const nextOrder = current.length + 1;
      const fileName = `${String(nextOrder).padStart(2, '0')}_${baseName}.jpg`;
      blob = Utilities.newBlob(imageArg.bytes, mimeType, fileName);
    } else {
      throw new Error('Unsupported imageArg format');
    }

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return this.listEventImages(calendarId, eventId);
  }

  removeEventImage(calendarId, eventId, fileId) {
    const folderId = this.getEventFolderId(calendarId, eventId);
    if (!folderId) return this.listEventImages(calendarId, eventId);
    try {
      const file = DriveApp.getFileById(fileId);
      const parents = file.getParents();
      let onlyHere = true;
      while (parents.hasNext()) {
        const p = parents.next();
        if (p.getId() !== folderId) { onlyHere = false; break; }
      }
      if (onlyHere) file.setTrashed(true);
      else {
        const folder = DriveApp.getFolderById(folderId);
        folder.removeFile(file);
      }
    } catch {}
    this.renumberEventImages(calendarId, eventId);
    return this.listEventImages(calendarId, eventId);
  }

  reorderEventImages(calendarId, eventId, orderedIds = []) {
    const images = this.listEventImages(calendarId, eventId);
    const map = new Map(images.map(i => [i.id, i]));
    orderedIds.forEach((id, idx) => {
      const img = map.get(id);
      if (!img) return;
      try {
        const file = DriveApp.getFileById(id);
        const extMatch = img.name.match(/\.[^.]+$/);
        const ext = extMatch ? extMatch[0] : '.jpg';
        const baseCaption = img.caption || img.name.replace(/\.[^.]+$/, '');
        file.setName(`${String(idx + 1).padStart(2, '0')}_${baseCaption}${ext}`);
      } catch {}
    });
    return this.listEventImages(calendarId, eventId);
  }

  renumberEventImages(calendarId, eventId) {
    const imgs = this.listEventImages(calendarId, eventId);
    imgs.forEach((img, idx) => {
      try {
        const file = DriveApp.getFileById(img.id);
        const extMatch = img.name.match(/\.[^.]+$/);
        const ext = extMatch ? extMatch[0] : '.jpg';
        const baseCaption = img.caption || img.name.replace(/\.[^.]+$/, '');
        file.setName(`${String(idx + 1).padStart(2, '0')}_${baseCaption}${ext}`);
      } catch {}
    });
  }
}
