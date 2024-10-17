import React from "react";
import { Helmet } from "react-helmet";
import { NavbarWithMegaMenu } from "../components/navbar";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
  updateDoc,
  where,
  query,
  limit,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../config/firebase-config";
import { useDrag, useDrop } from "react-dnd";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const ItemTypes = {
  CARD: "card",
};
const EditTourPage = () => {
  const moveItem = (dragIndex, hoverIndex) => {
    const draggedItem = selectedPois[dragIndex];
    const newSortedItems = [...selectedPois];
    newSortedItems.splice(dragIndex, 1);
    newSortedItems.splice(hoverIndex, 0, draggedItem);
    setSelectedPois(newSortedItems);
  };
  const Item = ({ item, index }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.CARD,
      item: { type: ItemTypes.CARD, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: ItemTypes.CARD,
      hover: (item) => {
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        moveItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const opacity = isDragging ? 0.5 : 1;

    return (
      <div
        ref={(node) => drag(drop(node))}
        className={`grid grid-cols-12 gap-4 items-center mb-6 ${
          isDragging ? "opacity-50" : ""
        }`}
        style={{ cursor: "move" }}
      >
        <div className="col-span-10">
          <Input
            className="bg-white"
            icon={<PencilSquareIcon />}
            value={item.languages.de.name}
            readOnly
          />
        </div>
        <div className="col-span-1">
          <Link to={"/poi/" + item.id}>
            <PencilSquareIcon
              strokeWidth={2}
              className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
            ></PencilSquareIcon>
          </Link>
        </div>
        <div className="col-span-1">
          <TrashIcon
            onClick={() => removePoi(item.id)}
            strokeWidth={2}
            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
          ></TrashIcon>
        </div>
      </div>
    );
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [tourID, setTourID] = useState("");

  const [pois, setPois] = useState([]);
  const [selectedPois, setSelectedPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState("");
  const [addCompleted, setAddCompleted] = useState(true);
  const [canAddPoi, setCanAddPoi] = useState(false);
  const handleSelectChange = (value) => {
    setSelectedPoi(value);
  };
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
  const [priority, setPriority] = useState(0);
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
  const [oldImages, setOldImages] = useState([]);

  const [descAudioFileDeUrl, setDescAudioFileDeUrl] = useState("");
  const [isDescAudioFileDe, setIsDescAudioFileDe] = useState(false);
  const [descAudioFileEnUrl, setDescAudioFileEnUrl] = useState("");
  const [isDescAudioFileEn, setIsDescAudioFileEn] = useState(false);
  const [firstAudioFileDeUrl, setFirstAudioFileDeUrl] = useState("");
  const [isFirstAudioFileDe, setIsFirstAudioFileDe] = useState(false);
  const [firstAudioFileEnUrl, setFirstAudioFileEnUrl] = useState("");
  const [isFirstAudioFileEn, setIsFirstAudioFileEn] = useState(false);
  const [storyFileDeUrl, setStoryFileDeUrl] = useState("");
  const [isStoryFileDe, setIsStoryFileDe] = useState(false);
  const [storyFileEnUrl, setStoryFileEnUrl] = useState("");
  const [isStoryFileEn, setIsStoryFileEn] = useState(false);
  const [thumbFileUrl, setThumbFileUrl] = useState("");
  const [isThumbFile, setIsThumbFile] = useState(false);
  const [tourBGFileUrl, setTourBGFileUrl] = useState("");
  const [isTourBGFile, setIsTourBGFile] = useState(false);
  const removeOldImage = (index) => {
    setOldImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

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

        // Call fetchData after pois are set
        await fetchData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const fetchData = async (fetchedPois) => {
      const path = window.location.pathname;
      const id = path.split("/").pop(); // Assuming faq_id is at the end of the URL
      setTourID(id);
      const docRef = doc(db, "tour", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data(); // Extracts the data
        const poiProperties = data.pois;
        const poiIds = poiProperties.map((item) => item.poi.split("/").pop());
        const priorityMap = poiProperties.reduce((acc, item) => {
          const id = item.poi.split("/").pop();
          acc[id] = item.priority;
          return acc;
        }, {});
        const newPois = fetchedPois
          .filter((poi) => poiIds.includes(poi.id))
          .sort((a, b) => priorityMap[a.id] - priorityMap[b.id]);
        setSelectedPois(newPois);

        // Set other data as before
        setOldImages(data.images);
        setNameDe(data.languages.de.name);
        setNameEn(data.languages.en.name);
        setDescDe(data.languages.de.description);
        setDescEn(data.languages.en.description);
        setPublished(data.published);
        setFirstTextDe(data.languages.de.firstText);
        setFirstTextEn(data.languages.en.firstText);
        setVideoNameDe(data.languages.de.VideoName);
        setVideoNameEn(data.languages.en.VideoName);
        setVideoLinkDe(data.languages.de.videoLink);
        setVideoLinkEn(data.languages.en.videoLink);
        setDuration(data.duration);
        setDurationTime(data.durationTime);
        setPriority(data.priority);
        if (data.languages.de.DescriptionAudio) {
          setDescAudioFileDeUrl(data.languages.de.DescriptionAudio);
          setIsDescAudioFileDe(true);
        }
        if (data.languages.en.DescriptionAudio) {
          setDescAudioFileEnUrl(data.languages.en.DescriptionAudio);
          setIsDescAudioFileEn(true);
        }
        if (data.languages.de.firstAudio) {
          setFirstAudioFileDeUrl(data.languages.de.firstAudio);
          setIsFirstAudioFileDe(true);
        }
        if (data.languages.en.firstAudio) {
          setFirstAudioFileEnUrl(data.languages.en.firstAudio);
          setIsFirstAudioFileEn(true);
        }
        if (data.languages.de.audiostory) {
          setStoryFileDeUrl(data.languages.de.audiostory);
          setIsStoryFileDe(true);
        }
        if (data.languages.en.audiostory) {
          setStoryFileEnUrl(data.languages.en.audiostory);
          setIsStoryFileEn(true);
        }
        if (data.ThumbnailImage) {
          setThumbFileUrl(data.ThumbnailImage);
          setIsThumbFile(true);
        }
        if (data.TourBGImage) {
          setTourBGFileUrl(data.TourBGImage);
          setIsTourBGFile(true);
        }
      } else {
        console.log("No such document!");
      }
    };

    fetchPois();
  }, []);
  const extractFileName = (url) => {
    const path = url.split("?")[0]; // Removes query parameters
    const fileName = path.substring(path.lastIndexOf("/") + 1);
    return decodeURIComponent(fileName); // Decodes the URL-encoded characters
  };
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
        audiostoryUrl = storyFileDeUrl,
        audiostoryUrlEn = storyFileEnUrl,
        firstAudioUrl = firstAudioFileDeUrl,
        firstAudioUrlEn = firstAudioFileEnUrl,
        descAudioDeUrl = descAudioFileDeUrl,
        descAudioEnUrl = descAudioFileEnUrl,
        ThumbnailImageUrl = thumbFileUrl,
        TourBGImageUrl = tourBGFileUrl,
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
      const newImages = [...oldImages, ...imageUrls];
      const formattedArray = selectedPois.map((poi, index) => ({
        poi: `/poi/${poi.id}`,
        priority: index + 1,
      }));

      const tourData = {
        duration,
        durationTime,
        images: newImages,
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
        priority: priority,
        pois: formattedArray,
      };

      const docRef = doc(db, "tour", tourID);
      await updateDoc(docRef, tourData);
      setLoading(false);
      navigate("/tour");
    } catch (error) {
      console.error("Error during submission:", error);
      setLoading(false);
    }
  };
  return (
    <DndProvider backend={HTML5Backend}>
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
                    {isDescAudioFileDe ? (
                      <>
                        <div className="col-span-8">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={
                              "Aktuelle Datei : " +
                              extractFileName(descAudioFileDeUrl)
                            }
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 items-center flex">
                          <TrashIcon
                            strokeWidth={2}
                            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                            onClick={(e) => {
                              setDescAudioFileDeUrl("");
                              setIsDescAudioFileDe(false);
                            }}
                          ></TrashIcon>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9">
                        <FileInput
                          className="text-[#28557b]"
                          id="file-upload"
                          onChange={handleDescAudioDeChange}
                        />
                      </div>
                    )}
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
                    {isFirstAudioFileDe ? (
                      <>
                        <div className="col-span-8">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={
                              "Aktuelle Datei : " +
                              extractFileName(firstAudioFileDeUrl)
                            }
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 items-center flex">
                          <TrashIcon
                            strokeWidth={2}
                            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                            onClick={(e) => {
                              setFirstAudioFileDeUrl("");
                              setIsFirstAudioFileDe(false);
                            }}
                          ></TrashIcon>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9">
                        <FileInput
                          className="text-[#28557b]"
                          id="file-upload"
                          onChange={handleFileDeChange}
                        />
                      </div>
                    )}
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
                    {isStoryFileDe ? (
                      <>
                        <div className="col-span-8">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={
                              "Aktuelle Datei : " +
                              extractFileName(storyFileDeUrl)
                            }
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 items-center flex">
                          <TrashIcon
                            strokeWidth={2}
                            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                            onClick={(e) => {
                              setStoryFileDeUrl("");
                              setIsStoryFileDe(false);
                            }}
                          ></TrashIcon>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9">
                        <FileInput
                          className="text-[#28557b]"
                          id="file-upload"
                          onChange={handleAudioStoryDeChange}
                        />
                      </div>
                    )}
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
                    {isDescAudioFileEn ? (
                      <>
                        <div className="col-span-8">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={
                              "Aktuelle Datei : " +
                              extractFileName(descAudioFileEnUrl)
                            }
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 items-center flex">
                          <TrashIcon
                            strokeWidth={2}
                            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                            onClick={(e) => {
                              setDescAudioFileEnUrl("");
                              setIsDescAudioFileEn(false);
                            }}
                          ></TrashIcon>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9">
                        <FileInput
                          className="text-[#28557b]"
                          id="file-upload"
                          onChange={handleDescAudioEnChange}
                        />
                      </div>
                    )}
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
                    {isFirstAudioFileEn ? (
                      <>
                        <div className="col-span-8">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={
                              "Aktuelle Datei : " +
                              extractFileName(firstAudioFileEnUrl)
                            }
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 items-center flex">
                          <TrashIcon
                            strokeWidth={2}
                            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                            onClick={(e) => {
                              setFirstAudioFileEnUrl("");
                              setIsFirstAudioFileEn(false);
                            }}
                          ></TrashIcon>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9">
                        <FileInput
                          className="text-[#28557b]"
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
                    <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                      AudioStory
                    </div>
                    {isStoryFileEn ? (
                      <>
                        <div className="col-span-8">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={
                              "Aktuelle Datei : " +
                              extractFileName(storyFileEnUrl)
                            }
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 items-center flex">
                          <TrashIcon
                            strokeWidth={2}
                            className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                            onClick={(e) => {
                              setStoryFileEnUrl("");
                              setIsStoryFileEn(false);
                            }}
                          ></TrashIcon>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9">
                        <FileInput
                          className="text-[#28557b]"
                          id="file-upload"
                          onChange={handleAudioStoryEnChange}
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
                  return <Item key={index} item={poi} index={index} />;
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
              <div className="grid grid-cols-12 gap-4 items-center mb-6">
                {oldImages.map((old, index) => {
                  return (
                    <div className="col-span-3" key={index}>
                      <div>
                        <img src={old} alt="" />
                      </div>
                      <div className="mt-1">
                        <TrashIcon
                          strokeWidth={2}
                          className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                          onClick={(e) => {
                            removeOldImage(index);
                          }}
                        ></TrashIcon>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
        <div className="border-b-4 border-[#28557b] mx-5 mb-20">
          <div className="container m-auto mt-20 pb-12"></div>
        </div>
        <div className="container m-auto mt-12">
          <h1 className="text-[#28557b] text-3xl font-normal mb-12">
            Kurz Info
          </h1>
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
                {isTourBGFile ? (
                  <>
                    <div className="col-span-8">
                      <Input
                        className="bg-white"
                        icon={<PencilSquareIcon />}
                        value={
                          "Aktuelle Datei : " + extractFileName(tourBGFileUrl)
                        }
                        readOnly
                      />
                    </div>
                    <div className="col-span-1 items-center flex">
                      <TrashIcon
                        strokeWidth={2}
                        className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                        onClick={(e) => {
                          setTourBGFileUrl("");
                          setIsTourBGFile(false);
                        }}
                      ></TrashIcon>
                    </div>
                  </>
                ) : (
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleBGImageChange}
                    />
                  </div>
                )}
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
                {isThumbFile ? (
                  <>
                    <div className="col-span-8">
                      <Input
                        className="bg-white"
                        icon={<PencilSquareIcon />}
                        value={
                          "Aktuelle Datei : " + extractFileName(thumbFileUrl)
                        }
                        readOnly
                      />
                    </div>
                    <div className="col-span-1 items-center flex">
                      <TrashIcon
                        strokeWidth={2}
                        className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                        onClick={(e) => {
                          setThumbFileUrl("");
                          setIsThumbFile(false);
                        }}
                      ></TrashIcon>
                    </div>
                  </>
                ) : (
                  <div className="col-span-9">
                    <FileInput
                      className="text-[#28557b]"
                      id="file-upload"
                      onChange={handleThumbChange}
                    />
                  </div>
                )}
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
    </DndProvider>
  );
};

export default EditTourPage;
