import React from "react";
import { Helmet } from "react-helmet";
import { NavbarWithMegaMenu } from "../components/navbar";
import "./index.css";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Checkbox,
  Typography,
  Tooltip,
  Textarea,
  Spinner,
  Input,
} from "@material-tailwind/react";
import { FileInput } from "flowbite-react";
import DeuFlagImg from "../../images/flags/deuflage.png";
import AMFlagImg from "../../images/flags/amflag.png";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  limit,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import {
  db,
  auth,
  storage,
  prefix_storage,
} from "../../config/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const EditExperiencePage = () => {
  const navigate = useNavigate();
  const [experienceItem, setExperienceItem] = useState({});
  const audioRefDe = useRef(null);
  const audioRefEn = useRef(null);
  const [audioSrcDe, setAudioSrcDe] = useState(null);
  const [audioSrcEn, setAudioSrcEn] = useState(null);
  const [bildSrcDe, setBildSrcDe] = useState(null);
  const [bildSrcEn, setBildSrcEn] = useState(null);
  const [isModalOpenDe, setIsModalOpenDe] = useState(false);
  const [isModalOpenDeBasic, setIsModalOpenDeBasic] = useState(false);
  const [isModalOpenEn, setIsModalOpenEn] = useState(false);
  const [isModalOpenEnBasic, setIsModalOpenEnBasic] = useState(false);
  const [error, setError] = useState(false);
  const [experienceID, setExperienceID] = useState("");
  const [ExperienceCreated, setExperienceCreated] = useState("");
  const [basicfileDeUrl, setFileDeUrl] = useState("");
  const [basicfileEnUrl, setFileEnUrl] = useState("");
  const [basicbildDeUrl, setBildDeUrl] = useState("");
  const [basicbildEnUrl, setBildEnUrl] = useState("");
  const [isDeAudio, setIsDeAudio] = useState(false);
  const [isEnAudio, setIsEnAudio] = useState(false);
  const [isDeBild, setIsDeBild] = useState(false);
  const [isEnBild, setIsEnBild] = useState(false);
  const [priority, setPriority] = useState(0);

  const [loading, setLoading] = useState(false);
  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descDe, setDescDe] = useState("");
  const [published, setPublished] = useState(false);
  const [buttonNameDe, setButtonNameDe] = useState("");
  const [buttonNameEn, setButtonNameEn] = useState("");
  const [buttonLinkDe, setButtonLinkDe] = useState("");
  const [buttonLinkEn, setButtonLinkEn] = useState("");
  const [titleDeError, setTitleDeError] = useState(false);
  const [titleEnError, setTitleEnError] = useState(false);
  const [descDeError, setDescDeError] = useState(false);
  const [descEnError, setDescEnError] = useState(false);

  const [fileDe, setDeFile] = useState(null);
  const [fileEn, setEnFile] = useState(null);
  const [bildDe, setDeBild] = useState(null);
  const [bildEn, setEnBild] = useState(null);

  const modalToggleDe = (isOpen) => {
    setIsModalOpenDe(isOpen);
  };
  const modalToggleEn = (isOpen) => {
    setIsModalOpenEn(isOpen);
  };
  const modalToggleDeBasic = (isOpen) => {
    setIsModalOpenDeBasic(isOpen);
  };
  const modalToggleEnBasic = (isOpen) => {
    setIsModalOpenEnBasic(isOpen);
  };

  useEffect(() => {
    async function fetchData() {
      const path = window.location.pathname;
      const id = path.split("/").pop(); // Assuming faq_id is at the end of the URL
      setExperienceID(id);
      const docRef = doc(db, "experiences", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data(); // Extracts the data
        setExperienceItem(data);
        setTitleDe(data.languages.de.title);
        setTitleEn(data.languages.en.title);
        setDescEn(data.languages.en.description);
        setDescDe(data.languages.de.description);
        setPublished(data.published);
        setButtonNameDe(data.languages.de.buttonName);
        setButtonLinkDe(data.languages.de.buttonLink);
        setButtonNameEn(data.languages.en.buttonName);
        setButtonLinkEn(data.languages.en.buttonLink);
        setExperienceCreated(data.createdAt);

        setPriority(data.priority);

        if (data.languages.de.audio) {
          const storageRef = ref(
            storage,
            data.languages.de.audio.replace("gs://" + prefix_storage + "/", "")
          );
          const url = await getDownloadURL(storageRef);
          setFileDeUrl(url);
          setIsDeAudio(true);
        }
        if (data.languages.en.audio) {
          const storageRef = ref(
            storage,
            data.languages.en.audio.replace("gs://" + prefix_storage + "/", "")
          );
          const url = await getDownloadURL(storageRef);
          setFileEnUrl(url);
          setIsEnAudio(true);
        }

        if (data.languages.de.image) {
          const storageRef = ref(
            storage,
            data.languages.de.image.replace("gs://" + prefix_storage + "/", "")
          );
          const url = await getDownloadURL(storageRef);
          setBildDeUrl(url);
          setIsDeBild(true);
        }
        if (data.languages.en.image) {
          const storageRef = ref(
            storage,
            data.languages.en.image.replace("gs://" + prefix_storage + "/", "")
          );
          const url = await getDownloadURL(storageRef);
          setBildEnUrl(url);
          setIsEnBild(true);
        }
      } else {
        console.log("No such document!");
      }
    }
    fetchData();
  }, []);

  const handleFileDeChange = (event) => {
    const selectedFile = event.target.files[0];
    setDeFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setAudioSrcDe(event.target.result); // Set audio source
        resetAudioDe();
      };

      reader.readAsDataURL(selectedFile); // Convert file to data URL
    }
  };
  const handleFileEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setEnFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setAudioSrcEn(event.target.result); // Set audio source
        resetAudioEn();
      };

      reader.readAsDataURL(selectedFile); // Convert file to data URL
    }
  };
  const resetAudioDe = () => {
    if (audioRefDe.current) {
      audioRefDe.current.pause(); // Stop the old audio
      audioRefDe.current.load(); // Reload the new source
    }
  };
  const resetAudioEn = () => {
    if (audioRefEn.current) {
      audioRefEn.current.pause(); // Stop the old audio
      audioRefEn.current.load(); // Reload the new source
    }
  };

  const handleBildDeChange = (event) => {
    const selectedFile = event.target.files[0];
    setDeBild(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBildSrcDe(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const handleBildEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setEnBild(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBildSrcEn(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const getCurrentTime = () => {
    const now = new Date();
    return now.toISOString().split(".")[0] + "+00:00"; // Removes milliseconds
  };
  const extractFileName = (url) => {
    const path = url.split("?")[0]; // Removes query parameters
    const fileName = path.substring(path.lastIndexOf("/") + 1);
    return decodeURIComponent(fileName); // Decodes the URL-encoded characters
  };
  const onSubmit = async () => {
    if (titleDe === "" || titleEn === "" || descDe === "" || descEn === "")
      setError(true);
    if (titleDe === "") {
      setTitleDeError(true);
      return;
    } else if (descDe === "") {
      setDescDeError(true);
      return;
    } else if (titleEn === "") {
      setTitleEnError(true);
      return;
    } else if (descEn === "") {
      setDescEnError(true);
      return;
    }

    setLoading(true);

    // Use basic URLs as defaults
    let fileDeUrl = experienceItem.languages.de.audio;
    let fileEnUrl = experienceItem.languages.en.audio;
    let bildDeUrl = experienceItem.languages.de.image;
    let bildEnUrl = experienceItem.languages.en.image;

    // Function to upload files and get URLs
    const uploadFile = async (file) => {
      if (!file) return null;
      const timestamp = Date.now(); // Get the current timestamp
      const fileNameWithTimestamp = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileNameWithTimestamp);
      try {
        await uploadBytes(storageRef, file);
        const gsUrl = `gs://${prefix_storage}/${fileNameWithTimestamp}`;
        return gsUrl;
      } catch (error) {
        console.error("Error uploading file:", error);
        return null;
      }
    };

    // Use Promise.all to upload all files concurrently
    const [
      uploadedFileDeUrl,
      uploadedFileEnUrl,
      uploadedBildDeUrl,
      uploadedBildEnUrl,
    ] = await Promise.all([
      uploadFile(fileDe),
      uploadFile(fileEn),
      uploadFile(bildDe),
      uploadFile(bildEn),
    ]);

    // Update the URLs if they were successfully uploaded
    if (uploadedFileDeUrl) fileDeUrl = uploadedFileDeUrl;
    if (uploadedFileEnUrl) fileEnUrl = uploadedFileEnUrl;
    if (uploadedBildDeUrl) bildDeUrl = uploadedBildDeUrl;
    if (uploadedBildEnUrl) bildEnUrl = uploadedBildEnUrl;

    const experienceData = {
      languages: {
        de: {
          audio: fileDeUrl,
          buttonLink: buttonLinkDe,
          buttonName: buttonNameDe,
          description: descDe,
          image: bildDeUrl,
          title: titleDe,
        },
        en: {
          audio: fileEnUrl,
          buttonLink: buttonLinkEn,
          buttonName: buttonNameEn,
          description: descEn,
          image: bildEnUrl,
          title: titleEn,
        },
      },
      priority: priority,
      published: published,
      createdAt: ExperienceCreated,
    };

    const docRef = doc(db, "experiences", experienceID);
    await updateDoc(docRef, experienceData);
    setLoading(false);
    navigate("/offersnews");
  };
  return (
    <>
      <Helmet>
        <title>Neuen Entdecken-Eintrag erstellen | BremenGo</title>
        <meta name="description" content="BremenGo Home Screen" />
      </Helmet>
      <NavbarWithMegaMenu />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <Spinner size="3xl" color="white" />
        </div>
      )}
      <div className="border-b-4 border-[#5A5A5A] mx-5">
        <div className="container m-auto mt-20 pb-12">
          <h1 className="text-[#5A5A5A] text-3xl font-medium">
            Neuen Entdecken-Eintrag erstellen
          </h1>
        </div>
      </div>
      <div className="container m-auto mt-12">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="text-center m-auto mb-16">
              <img src={DeuFlagImg} className="m-auto" />
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Überschrift
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={titleDe}
                      onChange={(e) => {
                        setTitleDe(e.target.value);
                        setTitleDeError(false);
                        setError(false);
                      }}
                    />
                    {titleDeError ? (
                      <p className="text-red-800">
                        Bitte fülle dieses Feld aus.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip
                  content="Format: Hochformat, max. Dateigröße: 150kB"
                  placement="top"
                >
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#5A5A5A]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Bild
                  </div>
                  {isDeBild ? (
                    <>
                      <div className="col-span-8">
                        <div className="relative my-2 w-[max-content]">
                          {/* Thumbnail Preview */}
                          <img
                            src={basicbildDeUrl}
                            alt="Preview"
                            className="w-72 h-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => modalToggleDeBasic(true)} // Open modal on click
                          />

                          {/* Full-Size Modal */}
                          {isModalOpenDeBasic && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <img
                                src={basicbildDeUrl}
                                alt="Full Size Preview"
                                className="max-w-full max-h-full rounded-lg shadow-xl"
                              />
                              <button
                                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full shadow-md"
                                onClick={() => modalToggleDeBasic(false)} // Close modal on click
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <Input
                          className="bg-white"
                          icon={<PencilSquareIcon />}
                          value={
                            "Aktuelle Datei : " +
                            extractFileName(basicbildDeUrl)
                          }
                          readOnly
                        />
                      </div>
                      <div className="col-span-1 items-center flex">
                        <TrashIcon
                          strokeWidth={2}
                          className="h-6 w-6 text-[#5A5A5A]  cursor-pointer m-auto"
                          onClick={(e) => {
                            setBildDeUrl("");
                            setIsDeBild(false);
                          }}
                        ></TrashIcon>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-9">
                      <FileInput
                        className="text-[#5A5A5A]"
                        accept="image/*"
                        id="file-upload"
                        onChange={handleBildDeChange}
                      />
                      {bildSrcDe && (
                        <div className="relative mt-2 w-[max-content]">
                          {/* Thumbnail Preview */}
                          <img
                            src={bildSrcDe}
                            alt="Preview"
                            className="w-72 h-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => modalToggleDe(true)} // Open modal on click
                          />

                          {/* Full-Size Modal */}
                          {isModalOpenDe && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <img
                                src={bildSrcDe}
                                alt="Full Size Preview"
                                className="max-w-full max-h-full rounded-lg shadow-xl"
                              />
                              <button
                                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full shadow-md"
                                onClick={() => modalToggleDe(false)} // Close modal on click
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip
                  content="Unbegrenzte Anzahl an Zeichen"
                  placement="top"
                >
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#5A5A5A]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Text
                  </div>
                  <div className="col-span-9">
                    <Textarea
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={descDe}
                      onChange={(e) => {
                        setDescDeError(false);
                        setError(false);
                        setDescDe(e.target.value);
                      }}
                    />
                    {descDeError ? (
                      <p className="text-red-800">
                        Bitte fülle dieses Feld aus.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip
                  content="Vorlesetext für Barrierefreiheit, Audioformat: mp4"
                  placement="top"
                >
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#5A5A5A]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Audio
                  </div>
                  {isDeAudio ? (
                    <>
                      <div className="col-span-8">
                        <Input
                          className="bg-white"
                          icon={<PencilSquareIcon />}
                          value={
                            "Aktuelle Datei : " +
                            extractFileName(basicfileDeUrl)
                          }
                          readOnly
                        />
                        <audio controls className="mt-2">
                          <source src={basicfileDeUrl} type="audio/mp3" />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                      <div className="col-span-1 items-center flex">
                        <TrashIcon
                          strokeWidth={2}
                          className="h-6 w-6 text-[#5A5A5A]  cursor-pointer m-auto"
                          onClick={(e) => {
                            setFileDeUrl("");
                            setIsDeAudio(false);
                          }}
                        ></TrashIcon>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-9">
                      <FileInput
                        className="text-[#5A5A5A]"
                        accept="audio/*"
                        id="file-upload"
                        onChange={handleFileDeChange}
                      />
                      {audioSrcDe && (
                        <audio ref={audioRefDe} controls className="mt-2">
                          <source src={audioSrcDe} type="audio/mp3" />
                          Your browser does not support the audio tag.
                        </audio>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Button Name
                  </div>
                  <div className="col-span-9 gap-8">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={buttonNameDe}
                      onChange={(e) => {
                        setButtonNameDe(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Button Link
                  </div>
                  <div className="col-span-9 gap-8">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={buttonLinkDe}
                      onChange={(e) => {
                        setButtonLinkDe(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-center m-auto mb-16">
              <img src={AMFlagImg} className="m-auto" />
            </div>
            <h1 className="text-[#5A5A5A] text-3xl font-normal mb-12"></h1>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Überschrift
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={titleEn}
                      onChange={(e) => {
                        setTitleEnError(false);
                        setError(false);
                        setTitleEn(e.target.value);
                      }}
                    />
                    {titleEnError ? (
                      <p className="text-red-800">
                        Bitte fülle dieses Feld aus.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Bild
                  </div>
                  {isEnBild ? (
                    <>
                      <div className="col-span-8">
                        <div className="relative my-2 w-[max-content]">
                          {/* Thumbnail Preview */}
                          <img
                            src={basicbildEnUrl}
                            alt="Preview"
                            className="w-72 h-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => modalToggleEnBasic(true)} // Open modal on click
                          />

                          {/* Full-Size Modal */}
                          {isModalOpenEnBasic && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <img
                                src={basicbildEnUrl}
                                alt="Full Size Preview"
                                className="max-w-full max-h-full rounded-lg shadow-xl"
                              />
                              <button
                                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full shadow-md"
                                onClick={() => modalToggleEnBasic(false)} // Close modal on click
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <Input
                          className="bg-white"
                          icon={<PencilSquareIcon />}
                          value={
                            "Aktuelle Datei : " +
                            extractFileName(basicbildEnUrl)
                          }
                          readOnly
                        />
                      </div>
                      <div className="col-span-1 items-center flex">
                        <TrashIcon
                          strokeWidth={2}
                          className="h-6 w-6 text-[#5A5A5A]  cursor-pointer m-auto"
                          onClick={(e) => {
                            setBildEnUrl("");
                            setIsEnBild(false);
                          }}
                        ></TrashIcon>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-9">
                      <FileInput
                        className="text-[#5A5A5A]"
                        accept="image/*"
                        id="file-upload"
                        onChange={handleBildEnChange}
                      />
                      {bildSrcEn && (
                        <div className="relative mt-2 w-[max-content]">
                          {/* Thumbnail Preview */}
                          <img
                            src={bildSrcEn}
                            alt="Preview"
                            className="w-72 h-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => modalToggleEn(true)} // Open modal on click
                          />

                          {/* Full-Size Modal */}
                          {isModalOpenEn && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <img
                                src={bildSrcEn}
                                alt="Full Size Preview"
                                className="max-w-full max-h-full rounded-lg shadow-xl"
                              />
                              <button
                                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full shadow-md"
                                onClick={() => modalToggleEn(false)} // Close modal on click
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Text
                  </div>
                  <div className="col-span-9">
                    <Textarea
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={descEn}
                      onChange={(e) => {
                        setDescEnError(false);
                        setError(false);
                        setDescEn(e.target.value);
                      }}
                    />
                    {descEnError ? (
                      <p className="text-red-800">
                        Bitte fülle dieses Feld aus.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Audio
                  </div>
                  {isEnAudio ? (
                    <>
                      <div className="col-span-8">
                        <Input
                          className="bg-white"
                          icon={<PencilSquareIcon />}
                          value={
                            "Aktuelle Datei : " +
                            extractFileName(basicfileEnUrl)
                          }
                          readOnly
                        />
                        <audio controls className="mt-2">
                          <source src={basicfileEnUrl} type="audio/mp3" />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                      <div className="col-span-1 items-center flex">
                        <TrashIcon
                          strokeWidth={2}
                          className="h-6 w-6 text-[#5A5A5A]  cursor-pointer m-auto"
                          onClick={(e) => {
                            setFileEnUrl("");
                            setIsEnAudio(false);
                          }}
                        ></TrashIcon>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-9">
                      <FileInput
                        className="text-[#5A5A5A]"
                        accept="audio/*"
                        id="file-upload"
                        onChange={handleFileEnChange}
                      />
                      {audioSrcEn && (
                        <audio ref={audioRefEn} controls className="mt-2">
                          <source src={audioSrcEn} type="audio/mp3" />
                          Your browser does not support the audio tag.
                        </audio>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Button Name
                  </div>
                  <div className="col-span-9 gap-8">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={buttonNameEn}
                      onChange={(e) => {
                        setButtonNameEn(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#5A5A5A] text-xl">
                    Button Link
                  </div>
                  <div className="col-span-9 gap-8">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={buttonLinkEn}
                      onChange={(e) => {
                        setButtonLinkEn(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b-4 border-[#5A5A5A] mx-5 mb-40">
        <div className="container m-auto mt-20 pb-12"></div>
      </div>
      <div className="container m-auto mb-40">
        <div className="grid lg:grid-cols-6">
          <div className="col-span-4">
            <Checkbox
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              label={
                <Typography className="flex font-semibold text-[#5A5A5A]">
                  Veröffentlichen
                </Typography>
              }
            />
          </div>
          <div>
            <Link to="/offersnews">
              <Button
                variant="outlined"
                className="text-[#5A5A5A] px-10 bg-white border-none"
              >
                Abbrechen
              </Button>
            </Link>
          </div>
          <div>
            <Button
              variant="outlined"
              className="text-[#5A5A5A] px-10 bg-white border-none hover:text-red-800"
              onClick={onSubmit}
            >
              Speichern
            </Button>
            {error ? (
              <div className="text-red-800 mt-2">
                Bitte fülle alle Pflichtfelder aus.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditExperiencePage;
