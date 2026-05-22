/* eslint-disable react/prop-types */
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import { Fragment, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadProductImage } from "../../../../services/UploadService";
import HashLoader from "react-spinners/HashLoader";
import { toast } from "react-toastify";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

/** Single-slot picture-card upload — same UX as cover gallery (`UploadImages`). */
const VariantImageUpload = ({
  imageUrl,
  tokenAdmin,
  onUrlChange,
  uploadUid = "variant-img",
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const fileList =
    imageUrl && String(imageUrl).trim() !== ""
      ? [
          {
            uid: uploadUid,
            name: imageUrl.slice(imageUrl.lastIndexOf("/") + 1) || "image",
            status: "done",
            url: imageUrl,
          },
        ]
      : [];

  const mutateUpload = useMutation({
    mutationFn: (file) => uploadProductImage(file, tokenAdmin),
  });

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewTitle(file.name || "Preview");
    setPreviewOpen(true);
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const data = await mutateUpload.mutateAsync(file);
      onUrlChange?.(data.url);
      onSuccess(data);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to upload image");
      onError(error);
    }
  };

  const handleRemove = () => {
    onUrlChange?.("");
  };

  const uploadButton = (
    <div>
      {mutateUpload.isLoading ? (
        <HashLoader size={28} color="#ab7a5f" />
      ) : (
        <Fragment>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </Fragment>
      )}
    </div>
  );

  return (
    <Fragment>
      <Upload
        customRequest={customRequest}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onRemove={handleRemove}
        maxCount={1}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </Fragment>
  );
};

export default VariantImageUpload;
