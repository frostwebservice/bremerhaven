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
  addDoc,
  query,
  limit,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../config/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const NewEvent = () => {
  const navigate = useNavigate();
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
  const onSubmit = async () => {
    // Input validation
    if (titleDe === "") return setTitleDeError(true);
    if (descDe === "") return setDescDeError(true);
    if (titleEn === "") return setTitleEnError(true);
    if (descEn === "") return setDescEnError(true);

    setLoading(true);

    try {
      // Get the highest priority from the database
      const q = query(
        collection(db, "events"),
        orderBy("priority", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      let maxPriority = querySnapshot.empty
        ? 0
        : querySnapshot.docs[0].data().priority;

      const uploadFile = async (file) => {
        if (!file) return null; // Skip if no file
        const timestamp = Date.now(); // Get the current timestamp
        const fileNameWithTimestamp = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileNameWithTimestamp);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

      // Upload all files in parallel
      const [fileDeUrl, fileEnUrl, bildDeUrl, bildEnUrl] = await Promise.all([
        uploadFile(fileDe),
        uploadFile(fileEn),
        uploadFile(bildDe),
        uploadFile(bildEn),
      ]);

      // Prepare event data
      const eventData = {
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
        priority: maxPriority + 1,
        published: published,
        createdAt: getCurrentTime(),
      };

      // Add event to the database
      await addDoc(collection(db, "events"), eventData);

      setLoading(false);
      navigate("/offersnews");
    } catch (error) {
      console.error("Error during submission:", error);
      setLoading(false); // Ensure loading state is turned off on error
    }
  };
  return (
    <>
      <Helmet>
        <title>Neuen Erlebnis-Eintrag erstellen | BremerhavenGuide</title>
        <meta name="description" content="BremerhavenGuide Home Screen" />
      </Helmet>
      <NavbarWithMegaMenu />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <Spinner size="3xl" color="white" />
        </div>
      )}
      <div className="border-b-4 border-[#28557b] mx-5">
        <div className="container m-auto mt-20 pb-12">
          <h1 className="text-[#28557b] text-3xl font-medium">
            Neuen Erlebnis-Eintrag erstellen
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
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
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
                  content="Format: Quadrat, max. Dateigröße: 150kB"
                  placement="top"
                >
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#28557b]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Bild
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleBildDeChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip
                  content="max. 280 Zeichen inkl. Leerzeichen"
                  placement="top"
                >
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#28557b]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Text
                  </div>
                  <div className="col-span-9">
                    <Textarea
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={descDe}
                      onChange={(e) => {
                        setDescDeError(false);
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
                    className="h-10 w-10 text-[#28557b]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Audio
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleFileDeChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
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
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
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
            <h1 className="text-[#28557b] text-3xl font-normal mb-12"></h1>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Überschrift
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={titleEn}
                      onChange={(e) => {
                        setTitleEnError(false);
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
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Bild
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleBildEnChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Text
                  </div>
                  <div className="col-span-9">
                    <Textarea
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={descEn}
                      onChange={(e) => {
                        setDescEnError(false);
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
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Audio
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleFileEnChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
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
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
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
      <div className="border-b-4 border-[#28557b] mx-5 mb-40">
        <div className="container m-auto mt-20 pb-12"></div>
      </div>
      <div className="container m-auto mb-40">
        <div className="grid lg:grid-cols-6">
          <div className="col-span-4">
            <Checkbox
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              label={
                <Typography className="flex font-semibold text-[#28557b]">
                  Veröffentlichen
                </Typography>
              }
            />
          </div>
          <div>
            <Link to="/offersnews">
              <Button
                variant="outlined"
                className="text-[#28557b] px-10 bg-white border-none"
              >
                Abbrechen
              </Button>
            </Link>
          </div>
          <div>
            <Button
              variant="outlined"
              className="text-[#28557b] px-10 bg-white border-none hover:text-red-800"
              onClick={onSubmit}
            >
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewEvent;