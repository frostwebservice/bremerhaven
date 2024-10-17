import React from "react";
import { Helmet } from "react-helmet";
import { NavbarWithMegaMenu } from "../components/navbar";
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
  Select,
  Option,
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
  where,
  query,
  limit,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../config/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const NewTourPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pois, setPois] = useState([]);
  const [selectedPois, setSelectedPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState("");
  const [addCompleted, setAddCompleted] = useState(true);
  const [canAddPoi, setCanAddPoi] = useState(false);
  const [arrayImageUrls, setArrayImageUrls] = useState([]);
  const handleSelectChange = (value) => {
    setSelectedPoi(value);
  };
  console.log(selectedPois);
  const addNewPoi = () => {
    if (addCompleted) {
      setCanAddPoi(true);
      setAddCompleted(false);
    }
  };
  const plusNewPoi = () => {
    if (selectedPoi == "") return;
    const selectedPoiTemp = pois.find((poi) => poi.id === selectedPoi); // Find selected POI from the list

    // if (selectedPoiTemp && !selectedPois.includes(selectedPoiTemp)) {
    setSelectedPois([...selectedPois, selectedPoiTemp]); // Add to selectedPois array
    // }
    setCanAddPoi(false);
    setAddCompleted(true);
    setSelectedPoi("");
  };
  const cancelNewPoi = () => {
    setSelectedPoi("");
    setCanAddPoi(false);
    setAddCompleted(true);
  };
  const removePoi = (poiId) => {
    setSelectedPois(selectedPois.filter((poi) => poi.id !== poiId));
  };
  const [nameDe, setNameDe] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descDe, setDescDe] = useState("");
  const [published, setPublished] = useState(false);
  const [firstTextDe, setFirstTextDe] = useState("");
  const [firstTextEn, setFirstTextEn] = useState("");

  const [nameDeError, setNameDeError] = useState(false);
  const [nameEnError, setNameEnError] = useState(false);
  const [descDeError, setDescDeError] = useState(false);
  const [descEnError, setDescEnError] = useState(false);

  const [videoNameDe, setVideoNameDe] = useState("");
  const [videoNameEn, setVideoNameEn] = useState("");
  const [videoLinkDe, setVideoLinkDe] = useState("");
  const [videoLinkEn, setVideoLinkEn] = useState("");
  const [duration, setDuration] = useState("");
  const [durationTime, setDurationTime] = useState("");

  const [fileDe, setFileDe] = useState(null);
  const [fileEn, setFileEn] = useState(null);
  const [DescAudioDe, setDescAudioDe] = useState(null);
  const [DescAudioEn, setDescAudioEn] = useState(null);
  const [storyDe, setStoryDe] = useState(null);
  const [storyEn, setStoryEn] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [tourBGImageFile, setTourBGImageFile] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchPois = async () => {
      try {
        const q = query(
          collection(db, "poi"),
          where("hideInOverview", "==", false) // Add the filter
        );
        const querySnapshot = await getDocs(q);

        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include document ID if needed
          ...doc.data(), // Spread document data
        }));
        setPois(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchPois();
  }, []);

  const handleFileDeChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileDe(selectedFile);
  };
  const handleFileEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileEn(selectedFile);
  };

  const handleBilderChange = (index, event) => {
    const selectedFile = event.target.files[0];
    const newImages = [...images];
    newImages[index].imageFile = selectedFile;
    setImages(newImages);
  };
  const handleDescAudioDeChange = (event) => {
    const selectedFile = event.target.files[0];
    setDescAudioDe(selectedFile);
  };
  const handleDescAudioEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setDescAudioEn(selectedFile);
  };

  const handleThumbChange = (event) => {
    const selectedFile = event.target.files[0];
    setThumbFile(selectedFile);
  };
  const handleBGImageChange = (event) => {
    const selectedFile = event.target.files[0];
    setTourBGImageFile(selectedFile);
  };
  const handleAudioStoryDeChange = (event) => {
    const selectedFile = event.target.files[0];
    setStoryDe(selectedFile);
  };
  const handleAudioStoryEnChange = (event) => {
    const selectedFile = event.target.files[0];
    setStoryEn(selectedFile);
  };

  // Function to add a new item to the linksDe array
  const addNewImage = () => {
    setImages([...images, { imageFile: null, imageUrl: "" }]); // Add a new empty string to the array
  };
  // const handleInputDeChange = (index, event) => {
  //   const newImages = [...images]; // Create a copy of the state array
  //   newImages[index].imageDescriptionDe = event.target.value; // Update the specific index with the new value
  //   setImages(newImages); // Update the state
  // };
  // const handleInputEnChange = (index, event) => {
  //   const newImages = [...images]; // Create a copy of the state array
  //   newImages[index].imageDescriptionEn = event.target.value; // Update the specific index with the new value
  //   setImages(newImages); // Update the state
  // };

  const onSubmit = async () => {
    if (nameDe === "") return setNameDeError(true);
    if (nameEn === "") return setNameEnError(true);
    if (descDe === "") return setDescDeError(true);
    if (descEn === "") return setDescEnError(true);

    setLoading(true);

    const filteredImages = images.filter((image) => image.imageFile !== null);

    const uploadFile = async (file) => {
      const timestamp = Date.now(); // Get the current timestamp
      const fileNameWithTimestamp = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileNameWithTimestamp);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    };

    try {
      // Parallel uploading of all images and files using Promise.all
      const imageUploadPromises = filteredImages.map(async (image) => {
        image.imageUrl = await uploadFile(image.imageFile);
        return image.imageUrl;
      });

      const [
        audiostoryUrl,
        audiostoryUrlEn,
        firstAudioUrl,
        firstAudioUrlEn,
        descAudioDeUrl,
        descAudioEnUrl,
        ThumbnailImageUrl,
        TourBGImageUrl,
      ] = await Promise.all([
        storyDe && uploadFile(storyDe),
        storyEn && uploadFile(storyEn),
        fileDe && uploadFile(fileDe),
        fileEn && uploadFile(fileEn),
        DescAudioDe && uploadFile(DescAudioDe),
        DescAudioEn && uploadFile(DescAudioEn),
        thumbFile && uploadFile(thumbFile),
        tourBGImageFile && uploadFile(tourBGImageFile),
        ...imageUploadPromises,
      ]);

      const imageUrls = filteredImages.map((image) => image.imageUrl);
      setArrayImageUrls(imageUrls);

      const formattedArray = selectedPois.map((poi, index) => ({
        poi: `/poi/${poi.id}`,
        priority: index + 1,
      }));

      const q = query(
        collection(db, "tour"),
        orderBy("priority", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      let maxPriority = 0;

      if (!querySnapshot.empty) {
        const highestPriorityDoc = querySnapshot.docs[0];
        maxPriority = highestPriorityDoc.data().priority;
      }

      const tourData = {
        duration,
        durationTime,
        images: imageUrls,
        TourBGImage: TourBGImageUrl,
        languages: {
          de: {
            firstText: firstTextDe,
            DescriptionAudio: descAudioDeUrl,
            firstAudio: firstAudioUrl,
            VideoName: videoNameDe,
            name: nameDe,
            description: descDe,
            videoLink: videoLinkDe,
            audiostory: audiostoryUrl,
          },
          en: {
            firstText: firstTextEn,
            DescriptionAudio: descAudioEnUrl,
            firstAudio: firstAudioUrlEn,
            VideoName: videoNameEn,
            name: nameEn,
            description: descEn,
            videoLink: videoLinkEn,
            audiostory: audiostoryUrlEn,
          },
        },
        ThumbnailImage: ThumbnailImageUrl,
        published,
        priority: maxPriority + 1,
        pois: formattedArray,
      };

      await addDoc(collection(db, "tour"), tourData);

      setLoading(false);
      navigate("/tour");
    } catch (error) {
      console.error("Error during submission:", error);
      setLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>Neuen Tour erstellen | BremerhavenGuide</title>
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
            Neuen Tour erstellen
          </h1>
        </div>
      </div>
      <div className="container m-auto mt-12">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="text-center m-auto mb-16">
              <img src={DeuFlagImg} className="m-auto" />
            </div>
            <h1 className="text-[#28557b] text-3xl font-normal mb-12">
              Tour Overview
            </h1>

            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip content="Max. 18 Zeichen" placement="top">
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#28557b]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Name
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={nameDe}
                      onChange={(e) => {
                        setNameDe(e.target.value);
                        setNameDeError(false);
                      }}
                    />
                    {nameDeError ? (
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
                  content="Max. 220 Zeichen inkl. Leerzeichen"
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
                    Kurztext
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
                  content="Vorlesetext für Barrierefreiheit, Audioformat: mp3, max. Dateigröße: 200kB"
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
                    Audio(Kurztext)
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleDescAudioDeChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-[#28557b] text-3xl font-normal mb-12 mt-12">
              Tour Details
            </h1>

            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip
                  content="Unbegrenzte Anzahl an Zeichen"
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
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={firstTextDe}
                      onChange={(e) => {
                        setFirstTextDe(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip
                  content="Vorlesetext für Barrierefreiheit, Audioformat: mp3, max. Dateigröße: 200kB"
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
              <div className="col-span-1">
                <Tooltip
                  content="Audiostory, Audioformat: mp3, max. Dateigröße: 200kB"
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
                    AudioStory
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleAudioStoryDeChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip content="Video Name" placement="top">
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#28557b]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Video Überschrift
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={videoNameDe}
                      onChange={(e) => {
                        setVideoNameDe(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1">
                <Tooltip content="Vimeo Weblink" placement="top">
                  <InformationCircleIcon
                    strokeWidth={2}
                    className="h-10 w-10 text-[#28557b]"
                  ></InformationCircleIcon>
                </Tooltip>
              </div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Video Link
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={videoLinkDe}
                      onChange={(e) => {
                        setVideoLinkDe(e.target.value);
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
            <h1 className="text-[#28557b] text-3xl font-normal mb-12">
              <br />
            </h1>

            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Name
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={nameEn}
                      onChange={(e) => {
                        setNameEnError(false);
                        setNameEn(e.target.value);
                      }}
                    />
                    {nameEnError ? (
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
                    Kurztext
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
                    Audio(Kurztext)
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleDescAudioEnChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-[#28557b] text-3xl font-normal mb-12 mt-12">
              <br />
            </h1>

            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-1"></div>
              <div className="col-span-11">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                    Text
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={firstTextEn}
                      onChange={(e) => {
                        setFirstTextEn(e.target.value);
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
                    AudioStory
                  </div>
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleAudioStoryEnChange}
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
                    Video Überschrift
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={videoNameEn}
                      onChange={(e) => {
                        setVideoNameEn(e.target.value);
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
                    Video Link
                  </div>
                  <div className="col-span-9">
                    <Input
                      className="bg-white"
                      icon={<PencilSquareIcon />}
                      value={videoLinkEn}
                      onChange={(e) => {
                        setVideoLinkEn(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b-4 border-[#28557b] mx-5 mb-20">
        <div className="container m-auto mt-20 pb-12"></div>
      </div>
      <div className="container m-auto mt-12">
        <div>
          <h1 className="text-[#28557b] text-3xl font-normal mb-12">
            POIs zuweisen
          </h1>
          <div className="grid grid-cols-12 gap-4 items-center mb-6">
            <div className="col-span-3"></div>
            <div className="col-span-9">
              {selectedPois.map((poi, index) => {
                return (
                  <div
                    className="grid grid-cols-12 gap-4 items-center mb-6"
                    key={index}
                  >
                    <div className="col-span-10">
                      <Input
                        className="bg-white"
                        icon={<PencilSquareIcon />}
                        value={poi.languages.de.name}
                        readOnly
                      />
                    </div>
                    <div className="col-span-1">
                      <Link to={"/poi/" + poi.id}>
                        <PencilSquareIcon
                          strokeWidth={2}
                          className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                        ></PencilSquareIcon>
                      </Link>
                    </div>
                    <div className="col-span-1">
                      <TrashIcon
                        onClick={() => removePoi(poi.id)}
                        strokeWidth={2}
                        className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                      ></TrashIcon>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {canAddPoi == true ? (
            <div className="grid grid-cols-12 gap-4 items-center mb-6">
              <div className="col-span-3"></div>
              <div className="col-span-9">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-10">
                    <Select
                      label="Select Poi"
                      className="bg-white"
                      value={selectedPoi}
                      onChange={(value) => handleSelectChange(value)}
                    >
                      {pois
                        .filter((poi) => !selectedPois.includes(poi))
                        .map((poi, index) => (
                          <Option key={index} value={poi.id}>
                            {poi.languages.de.name}
                          </Option>
                        ))}
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <PlusCircleIcon
                      onClick={plusNewPoi}
                      strokeWidth={2}
                      color="#28557b"
                      className="h-6 w-6 cursor-pointer m-auto"
                    ></PlusCircleIcon>
                  </div>
                  <div className="col-span-1">
                    <TrashIcon
                      onClick={cancelNewPoi}
                      strokeWidth={2}
                      className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                    ></TrashIcon>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="text-center mt-2">
            <div
              className="text-[#28557b] text-xl text-center mt-2 inline-flex items-center"
              onClick={addNewPoi}
            >
              POI hinzufügen
              <PlusCircleIcon
                strokeWidth={2}
                color="#28557b"
                className="h-6 w-6"
              >
                {" "}
              </PlusCircleIcon>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b-4 border-[#28557b] mx-5 mb-20">
        <div className="container m-auto mt-20 pb-12"></div>
      </div>
      <div className="container m-auto mt-12">
        <h1 className="text-[#28557b] text-3xl font-normal mb-12">Bilder</h1>
        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <div className="col-span-1">
            <Tooltip content="Tip Description" placement="top">
              <InformationCircleIcon
                strokeWidth={2}
                className="h-10 w-10 text-[#28557b]"
              ></InformationCircleIcon>
            </Tooltip>
          </div>
          <div className="col-span-11"></div>
        </div>
        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <div className="col-span-1"></div>
          <div className="col-span-11">
            {images.map((image, index) => {
              return (
                <>
                  <div className="grid grid-cols-12 mb-6">
                    <div className="col-span-1 flex items-center justify-end pr-2 text-[#28557b] text-xl"></div>
                    <div className="col-span-11">
                      <FileInput
                        className="text-[#28557b]"
                        id="file-upload"
                        onChange={(e) => handleBilderChange(index, e)}
                      />
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-2">
          <div
            className="text-[#28557b] text-xl text-center mt-2 inline-flex items-center"
            onClick={addNewImage}
          >
            Neues Bild hinzufügen
            <PlusCircleIcon strokeWidth={2} color="#28557b" className="h-6 w-6">
              {" "}
            </PlusCircleIcon>
          </div>
        </div>
      </div>
      <div className="border-b-4 border-[#28557b] mx-5 mb-20">
        <div className="container m-auto mt-20 pb-12"></div>
      </div>
      <div className="container m-auto mt-12">
        <h1 className="text-[#28557b] text-3xl font-normal mb-12">Kurz Info</h1>
        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <div className="col-span-1">
            <Tooltip
              content="Max. 9 Zeichen (z.B. 1 Stunde und 15 Minuten als „1,25 Std.“, oder 45 Minuten als „45 Min.“)"
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
              <div className="col-span-3 flex items-center justify-center pr-2 text-[#28557b] text-xl">
                Dauer
              </div>
              <div className="col-span-9">
                <Input
                  className="bg-white"
                  icon={<PencilSquareIcon />}
                  value={durationTime}
                  onChange={(e) => {
                    setDurationTime(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <div className="col-span-1">
            <Tooltip
              content="Max. 5 Zeichen, in km (z.B. 2,5 Kilometer als „2,5 km“)"
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
              <div className="col-span-3 flex items-center justify-center pr-2 text-[#28557b] text-xl">
                Länge
              </div>
              <div className="col-span-9">
                <Input
                  className="bg-white"
                  icon={<PencilSquareIcon />}
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <div className="col-span-1">
            <Tooltip content="Tour Vorschaubild" placement="top">
              <InformationCircleIcon
                strokeWidth={2}
                className="h-10 w-10 text-[#28557b]"
              ></InformationCircleIcon>
            </Tooltip>
          </div>
          <div className="col-span-11">
            <div className="grid grid-cols-12">
              <div className="col-span-3 flex items-center justify-center pr-2 text-[#28557b] text-xl">
                Tour Vorschaubild
              </div>
              <div className="col-span-9">
                <FileInput
                  className="text-[#28557b]"
                  id="file-upload"
                  onChange={handleBGImageChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <div className="col-span-1">
            <Tooltip content="Video Vorschaubild" placement="top">
              <InformationCircleIcon
                strokeWidth={2}
                className="h-10 w-10 text-[#28557b]"
              ></InformationCircleIcon>
            </Tooltip>
          </div>
          <div className="col-span-11">
            <div className="grid grid-cols-12">
              <div className="col-span-3 flex items-center justify-center pr-2 text-[#28557b] text-xl">
                Video Vorschaubild
              </div>
              <div className="col-span-9">
                <FileInput
                  className="text-[#28557b]"
                  id="file-upload"
                  onChange={handleThumbChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b-4 border-[#28557b] mx-5 mb-20">
        <div className="container m-auto mt-20 pb-12"></div>
      </div>

      <div className="container m-auto mt-40 mb-40">
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
            <Link to="/tour">
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

export default NewTourPage;