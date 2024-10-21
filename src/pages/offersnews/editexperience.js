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
import { useState, useEffect } from "react";
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
import { db, auth, storage } from "../../config/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const EditExperiencePage = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    async function fetchData() {
      const path = window.location.pathname;
      const id = path.split("/").pop(); // Assuming faq_id is at the end of the URL
      setExperienceID(id);
      const docRef = doc(db, "experiences", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data(); // Extracts the data
        console.log(data);
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

        setFileDeUrl(data.languages.de.audio);
        setFileEnUrl(data.languages.en.audio);
        setBildDeUrl(data.languages.de.image);
        setBildEnUrl(data.languages.en.image);

        setPriority(data.priority);

        if (data.languages.de.audio) {
          setIsDeAudio(true);
        }
        if (data.languages.en.audio) {
          setIsEnAudio(true);
        }

        if (data.languages.de.image) {
          setIsDeBild(true);
        }
        if (data.languages.en.image) {
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
  };
  const handleFileEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setEnFile(selectedFile);
  };
  const handleBildDeChange = (event) => {
    const selectedFile = event.target.files[0];
    setDeBild(selectedFile);
  };
  const handleBildEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setEnBild(selectedFile);
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
    let fileDeUrl = basicfileDeUrl;
    let fileEnUrl = basicfileEnUrl;
    let bildDeUrl = basicbildDeUrl;
    let bildEnUrl = basicbildEnUrl;

    // Function to upload files and get URLs
    const uploadFile = async (file) => {
      if (!file) return null;
      const timestamp = Date.now(); // Get the current timestamp
      const fileNameWithTimestamp = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileNameWithTimestamp);
      try {
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
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
        <title>Neuen Entdecken-Eintrag erstellen | BremerhavenGuide</title>
        <meta name="description" content="BremerhavenGuide Home Screen" />
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
                        Please fill out this field.
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
                        Please fill out this field.
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
                        Please fill out this field.
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
                        Please fill out this field.
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
