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
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../config/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const PrivacyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [DeItems, setDeItems] = useState([]);
  const [EnItems, setEnItems] = useState([]);
  const [data, setData] = useState();
  const [isCreate, setIsCreate] = useState(true);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    const fetchPrivacy = async () => {
      const q = query(collection(db, "page"), where("type", "==", "privacy"));
      const querySnapshot = await getDocs(q);
      const privacyList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include document ID if needed
        ...doc.data(),
      }));
      if (privacyList.empty) {
        setIsCreate(true);
      } else {
        setIsCreate(false);
        setData(privacyList[0]);
        setDeItems(privacyList[0].languages.de.DatenschutzElements);
        setEnItems(privacyList[0].languages.en.DatenschutzElements);
        setPublished(privacyList[0].published);
      }
    };

    fetchPrivacy();
  }, []);
  const handleInputDeChange = (index, key, value) => {
    const updatedItems = [...DeItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [key]: value,
    };
    setDeItems(updatedItems);
  };
  const handleRemoveDeElement = (index) => {
    const updatedItems = [...DeItems];
    updatedItems.splice(index, 1); // Removes the mth element
    setDeItems(updatedItems);
  };
  const handleRemoveEnElement = (index) => {
    const updatedItems = [...EnItems];
    updatedItems.splice(index, 1); // Removes the mth element
    setEnItems(updatedItems);
  };
  const addNewLink = () => {
    setDeItems([...DeItems, { Heading: "", Description: "" }]); // Add a new empty string to the array
  };

  const handleInputEnChange = (index, key, value) => {
    const updatedItems = [...EnItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [key]: value,
    };
    setEnItems(updatedItems);
  };

  // Function to add a new item to the linksDe array
  const addNewEnLink = () => {
    setEnItems([...EnItems, { Heading: "", Description: "" }]); // Add a new empty string to the array
  };

  const onSubmit = async () => {
    setLoading(true);
    const filteredLinksDe = DeItems.filter(
      (link) => link.Heading.trim() !== ""
    );
    const filteredLinksEn = EnItems.filter(
      (link) => link.Heading.trim() !== ""
    );

    const privacyData = {
      languages: {
        de: {
          DatenschutzElements: filteredLinksDe,
          title: "Datenschutz",
        },
        en: {
          DatenschutzElements: filteredLinksEn,
          title: "Privacy",
        },
      },
      published: published,
      type: "privacy",
    };
    if (isCreate) {
      await addDoc(collection(db, "page"), privacyData);
      setLoading(false);
      navigate("/page");
    } else {
      const docRef = doc(db, "page", data.id);
      await updateDoc(docRef, privacyData);
      setLoading(false);
      navigate("/page");
    }
  };
  return (
    <>
      <Helmet>
        <title>Bearbeiten Privacy | BremerhavenGuide</title>
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
            Bearbeiten Privacy
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
              Einleitung
            </h1>
            {DeItems.map((item, index) => {
              return (
                <div key={index}>
                  <div className="grid grid-cols-12 gap-4 items-center mb-6">
                    <div className="col-span-11">
                      <div className="grid grid-cols-12">
                        <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                          Überschrift
                        </div>
                        <div className="col-span-9">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={item.Heading}
                            onChange={(e) =>
                              handleInputDeChange(
                                index,
                                "Heading",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <TrashIcon
                        strokeWidth={2}
                        className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                        onClick={(e) => {
                          handleRemoveDeElement(index);
                        }}
                      ></TrashIcon>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 items-center mb-6">
                    <div className="col-span-11">
                      <div className="grid grid-cols-12">
                        <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                          Beschreibung
                        </div>
                        <div className="col-span-9">
                          <Textarea
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={item.Description}
                            onChange={(e) =>
                              handleInputDeChange(
                                index,
                                "Description",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
              );
            })}

            <div className="text-center mt-2">
              <div
                className="text-[#28557b] text-xl text-center mt-2 inline-flex items-center cursor-pointer"
                onClick={addNewLink}
              >
                Neuen Eintrag hinzufügen
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
          <div>
            <div className="text-center m-auto mb-16">
              <img src={AMFlagImg} className="m-auto" />
            </div>
            <h1 className="text-[#28557b] text-3xl font-normal mb-12">
              <br />
            </h1>
            {EnItems.map((item, index) => {
              return (
                <div key={index}>
                  <div className="grid grid-cols-12 gap-4 items-center mb-6">
                    <div className="col-span-11">
                      <div className="grid grid-cols-12">
                        <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                          Überschrift
                        </div>
                        <div className="col-span-9">
                          <Input
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={item.Heading}
                            onChange={(e) =>
                              handleInputEnChange(
                                index,
                                "Heading",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <TrashIcon
                        strokeWidth={2}
                        className="h-6 w-6 text-[#28557b]  cursor-pointer m-auto"
                        onClick={(e) => {
                          handleRemoveEnElement(index);
                        }}
                      ></TrashIcon>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 items-center mb-6">
                    <div className="col-span-11">
                      <div className="grid grid-cols-12">
                        <div className="col-span-3 flex items-center justify-end pr-2 text-[#28557b] text-xl">
                          Beschreibung
                        </div>
                        <div className="col-span-9">
                          <Textarea
                            className="bg-white"
                            icon={<PencilSquareIcon />}
                            value={item.Description}
                            onChange={(e) =>
                              handleInputEnChange(
                                index,
                                "Description",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
              );
            })}

            <div className="text-center mt-2">
              <div
                className="text-[#28557b] text-xl text-center mt-2 inline-flex items-center"
                onClick={addNewEnLink}
              >
                Neuen Eintrag hinzufügen
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
            <Link to="/page">
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

export default PrivacyPage;
