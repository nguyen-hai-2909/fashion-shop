/* eslint-disable react/prop-types */
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import { Fragment, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadProductImage } from "../../../../services/UploadService";
import HashLoader from "react-spinners/HashLoader";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UploadImages = (props) => {
  const { fileList, setFileList, tokenAdmin } = props;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const mutateUpload = useMutation({
    mutationFn: (file) => uploadProductImage(file, tokenAdmin),
  });

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    const name =
      file.name ||
      (file.url && file.url.includes("/")
        ? file.url.slice(file.url.lastIndexOf("/") + 1)
        : "");
    setPreviewTitle(name || "Preview");
    setPreviewOpen(true);
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const data = await mutateUpload.mutateAsync(file);
      setFileList((prev) => [
        ...prev,
        {
          uid: data.asset_id,
          name: data.original_filename || file.name,
          status: "done",
          url: data.url,
        },
      ]);
      onSuccess(data);
    } catch (error) {
      console.error(error);
      onError(error);
    }
  };

  const handleRemove = (file) => {
    const files = fileList.filter((el) => el?.uid !== file.uid);
    setFileList(files);
  };

  const uploadButton = (
    <div>
      {mutateUpload.isLoading ? (
        <HashLoader size={28} color="#ab7a5f" />
      ) : (
        <Fragment>
          <PlusOutlined />
          <div
            style={{
              marginTop: 8,
            }}
          >
            Upload
          </div>
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
      >
        {fileList.length > 4 ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img
          alt="example"
          style={{
            width: "100%",
          }}
          src={previewImage}
        />
      </Modal>
    </Fragment>
  );
};

export default UploadImages;
