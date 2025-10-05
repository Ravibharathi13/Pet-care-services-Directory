import mongoose from "mongoose";
import Service from "./models/Service.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/petcare";

// Consolidated seed: includes original 7-district sampleCenters + all additional districts
const allCenters = [
  // ===== Original 7 districts (from seed.js) =====
  // Coimbatore
  { name: "Animeta Veterinary Clinic", district: "Coimbatore", address: "Race Course Road, Coimbatore, Tamil Nadu 641018", phone: "+91 98765 43210", latitude: 11.0168, longitude: 76.9558, services: "Veterinary Doctors, 24 Hours Service, Telemedicine, Cow Treatment", rating: 4.5, hours: "9:00 AM - 9:00 PM, 24x7 Emergency" },
  { name: "Lyka Multi Speciality Pet Hospital", district: "Coimbatore", address: "Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012", phone: "+91 98765 43211", latitude: 11.0175, longitude: 76.9552, services: "Multi-specialty Care, Surgery, Vaccination, Consultation", rating: 4.8, hours: "24/7 Emergency Service" },
  { name: "Dr. Pet Veterinary Clinic", district: "Coimbatore", address: "31A, Damu Nagar, Puliakulam, Coimbatore, Tamil Nadu 641045", phone: "+91 98765 43212", latitude: 11.0162, longitude: 76.9565, services: "General Practice, Vaccination, Health Checkup", rating: 4.3, hours: "8:00 AM - 8:00 PM" },
  { name: "Veterinary Clinic Selvapuram", district: "Coimbatore", address: "No 9, Ramamoorthy Street, Cheran Nagar, Selvapuram North, Coimbatore, Tamil Nadu 641026", phone: "+91 98765 43213", latitude: 11.0180, longitude: 76.9545, services: "Vaccination, Health Checkup, Pet Care", rating: 4.6, hours: "9:00 AM - 6:00 PM" },
  { name: "Veterinary Clinic Singanallur", district: "Coimbatore", address: "15, Sarathi Nagar, Nanda Nagar, Singanallur, Tamil Nadu 641005", phone: "+91 98765 43214", latitude: 11.0155, longitude: 76.9570, services: "Pet Treatment, Surgery, Emergency Care", rating: 4.4, hours: "7:00 AM - 9:00 PM" },
  { name: "Humane Animal Society", district: "Coimbatore", address: "Coimbatore, Tamil Nadu 641012", phone: "+91 98765 43225", latitude: 11.0190, longitude: 76.9530, services: "Animal Rescue, ABC Program, Vaccination, Adoption", rating: 4.7, hours: "8:00 AM - 8:00 PM" },
  { name: "Government Veterinary Hospital", district: "Coimbatore", address: "Oppanakara Street, Coimbatore, Tamil Nadu 641001", phone: "+91 98765 43226", latitude: 11.0140, longitude: 76.9580, services: "Government Services, Vaccination, Basic Treatment", rating: 4.2, hours: "9:00 AM - 5:00 PM" },
  { name: "Pet Care Center Coimbatore", district: "Coimbatore", address: "Singanallur, Coimbatore, Tamil Nadu 641005", phone: "+91 98765 43227", latitude: 11.0200, longitude: 76.9520, services: "Emergency Care, Surgery, Vaccination, Consultation", rating: 4.9, hours: "24/7 Service" },

  // Erode
  { name: "Dhivish Pet Hospital", district: "Erode", address: "78.F Gandhiji Road Near Headpost Office, Periyar Nagar, Erode, Tamil Nadu 638001", phone: "+91 98652 75661", latitude: 11.3410, longitude: 77.7172, services: "Comprehensive Pet Care, Surgery, Vaccination, Pet Food & Accessories", rating: 4.7, hours: "9:30 AM - 8:00 PM" },
  { name: "Max Pet Clinic", district: "Erode", address: "Sathy Road, Veerappanchathiram, Erode, Tamil Nadu 638002", phone: "+91 73958 74646", latitude: 11.3420, longitude: 77.7165, services: "Vaccination, Wellness Programs, Pet Supplies, Treatment", rating: 4.2, hours: "9:00 AM - 8:30 PM" },
  { name: "SB Pet Clinic", district: "Erode", address: "Pari Nagar Kumalan Kuttai Iswaryam Plaza, Palayapalayam, Erode, Tamil Nadu 638011", phone: "+91 90038 98332", latitude: 11.3405, longitude: 77.7180, services: "State-of-art Facilities, Surgery, Health Checkup", rating: 4.8, hours: "2:00 PM - 8:00 PM" },
  { name: "Government Veterinary Hospital Erode", district: "Erode", address: "Anna Street, Vairapalayam, Erode, Tamil Nadu 638001", phone: "+91 98765 43218", latitude: 11.3430, longitude: 77.7155, services: "Government Services, Vaccination, Animal Health", rating: 4.3, hours: "9:00 AM - 5:00 PM" },
  { name: "Veterinary Hospital Surampatti", district: "Erode", address: "Veterinary Hospital Road, Surampattivalasu, Erode, Tamil Nadu 638002", phone: "+91 98765 43219", latitude: 11.3395, longitude: 77.7190, services: "Rural Veterinary Care, Livestock Treatment, Vaccination", rating: 4.6, hours: "8:00 AM - 6:00 PM" },
  { name: "Pet Care Clinic Erode", district: "Erode", address: "29/1 Sathy Road, Veerapanchatram, Erode, Tamil Nadu 638001", phone: "+91 98765 43228", latitude: 11.3440, longitude: 77.7145, services: "Pet Care, Surgery, Vaccination, Emergency Services", rating: 4.4, hours: "8:00 AM - 8:00 PM" },
  { name: "Animal Hospital Erode", district: "Erode", address: "Perundurai Road, Erode, Tamil Nadu 638052", phone: "+91 98765 43229", latitude: 11.3380, longitude: 77.7200, services: "Animal Treatment, Pet Supplies, Grooming", rating: 4.1, hours: "9:00 AM - 7:00 PM" },
  { name: "Veterinary Care Center", district: "Erode", address: "Chennimalai Road, Erode, Tamil Nadu 638004", phone: "+91 98765 43230", latitude: 11.3450, longitude: 77.7135, services: "Emergency Care, Surgery, Vaccination, Consultation", rating: 4.5, hours: "24/7 Service" },

  // Tiruppur
  { name: "Kriya Petcare Clinic", district: "Tiruppur", address: "60 Feet Rd, Kumar Nagar, Kamaraj Nagar, Tiruppur, Tamil Nadu 641603", phone: "+91 70944 94444", latitude: 11.1220, longitude: 77.3369, services: "Vaccinations, Deworming, Skin Treatment, Cardiac Problems, Kidney Stone", rating: 4.8, hours: "9:00 AM - 9:00 PM" },
  { name: "SKS Veterinary Hospital", district: "Tiruppur", address: "145, 75, 9th Cross St, KNP Puram, Odakkadu, Tiruppur, Tamil Nadu 641602", phone: "+91 86800 70005", latitude: 11.1091, longitude: 77.3370, services: "Dental Scaling, Castration, Full Body Checkup, Microchipping, Dialysis", rating: 4.4, hours: "9:30 AM - 2:00 PM & 5:00 PM - 8:30 PM" },
  { name: "Paws and Hooves Royal Animal Hospital", district: "Tiruppur", address: "7/2, KRR Layout, I st Street, Karuvampalayam, Tiruppur, Tamil Nadu 641604", phone: "+91 99426 23777", latitude: 11.0999, longitude: 77.3436, services: "Diagnostic, Therapeutic, Pet Surgery, Vaccination, Dental Care", rating: 4.6, hours: "24 Hours" },
  { name: "Universal Pet Care Hospital", district: "Tiruppur", address: "Thiruvalluvar Thottam, Karuvampalayam, Tiruppur, Tamil Nadu 641603", phone: "+91 98765 43223", latitude: 11.1095, longitude: 77.3400, services: "Universal Pet Care, Grooming, Training, Health Checkup", rating: 4.3, hours: "8:30 AM - 7:30 PM" },
  { name: "Government Veterinary Hospital Tiruppur", district: "Tiruppur", address: "Erode Road, Tiruppur, Tamil Nadu 641605", phone: "+91 98765 43224", latitude: 11.1075, longitude: 77.3425, services: "Government Veterinary Services, Vaccination, Animal Health", rating: 4.7, hours: "9:00 AM - 5:00 PM" },
  { name: "Veterinary Hospital Udumalaipettai", district: "Tiruppur", address: "Kangayam Road, Udumalaipettai, Tiruppur, Tamil Nadu 641606", phone: "+91 98765 43231", latitude: 11.1100, longitude: 77.3395, services: "Rural Veterinary Care, Livestock Treatment, Pet Care", rating: 4.5, hours: "8:00 AM - 6:00 PM" },
  { name: "Animal Care Clinic Tiruppur", district: "Tiruppur", address: "Palladam Road, Tiruppur, Tamil Nadu 641602", phone: "+91 98765 43232", latitude: 11.1065, longitude: 77.3430, services: "Pet Care, Grooming, Pet Food, Accessories", rating: 4.2, hours: "9:00 AM - 8:00 PM" },
  { name: "Veterinary Hospital Kangayam", district: "Tiruppur", address: "Dharapuram Road, Kangayam, Tiruppur, Tamil Nadu 641601", phone: "+91 98765 43233", latitude: 11.1110, longitude: 77.3390, services: "Government Services, Emergency Care, Vaccination, Consultation", rating: 4.9, hours: "24/7 Service" },

  // Salem
  { name: "Vetcare Animal Hospital", district: "Salem", address: "No. 45, Omalur Main Road, Salem, Tamil Nadu 636003", phone: "+91 98765 43234", latitude: 11.6643, longitude: 78.1460, services: "Multi-specialty Care, Surgery, Emergency Services, Pet Boarding", rating: 4.6, hours: "24/7 Emergency Service" },
  { name: "Pet Care Clinic Salem", district: "Salem", address: "Cherry Road, Fairlands, Salem, Tamil Nadu 636016", phone: "+91 98765 43235", latitude: 11.6761, longitude: 78.1389, services: "Vaccination, Health Checkup, Grooming, Pet Supplies", rating: 4.3, hours: "9:00 AM - 8:00 PM" },
  { name: "Animal Care Hospital Salem", district: "Salem", address: "Attur Road, Salem, Tamil Nadu 636004", phone: "+91 98765 43236", latitude: 11.6596, longitude: 78.1348, services: "Surgery, Dental Care, X-Ray, Laboratory Services", rating: 4.7, hours: "8:00 AM - 9:00 PM" },
  { name: "Government Veterinary Hospital Salem", district: "Salem", address: "Collectorate Complex, Salem, Tamil Nadu 636001", phone: "+91 98765 43237", latitude: 11.6540, longitude: 78.1460, services: "Government Services, Vaccination, Animal Health Programs", rating: 4.2, hours: "9:00 AM - 5:00 PM" },
  { name: "Salem Pet Hospital", district: "Salem", address: "Bangalore Road, Salem, Tamil Nadu 636005", phone: "+91 98765 43238", latitude: 11.6448, longitude: 78.1580, services: "Emergency Care, Surgery, Vaccination, Pet Training", rating: 4.8, hours: "24/7 Service" },
  { name: "Veterinary Care Center Yercaud", district: "Salem", address: "Yercaud Hills, Salem, Tamil Nadu 636601", phone: "+91 98765 43239", latitude: 11.7747, longitude: 78.2026, services: "Hill Station Pet Care, Emergency Services, Boarding", rating: 4.5, hours: "8:00 AM - 7:00 PM" },
  { name: "Animal Clinic Mettur", district: "Salem", address: "Mettur Dam Road, Mettur, Salem, Tamil Nadu 636401", phone: "+91 98765 43240", latitude: 11.7889, longitude: 77.8014, services: "Rural Pet Care, Livestock Treatment, Vaccination", rating: 4.4, hours: "9:00 AM - 6:00 PM" },
  { name: "Pet Paradise Salem", district: "Salem", address: "Junction Main Road, Salem, Tamil Nadu 636002", phone: "+91 98765 43241", latitude: 11.6692, longitude: 78.1378, services: "Comprehensive Pet Care, Grooming, Pet Accessories, Training", rating: 4.9, hours: "9:00 AM - 9:00 PM" },

  // Namakkal
  { name: "Namakkal Veterinary Hospital", district: "Namakkal", address: "Bypass Road, Namakkal, Tamil Nadu 637001", phone: "+91 98765 43242", latitude: 11.2189, longitude: 78.1677, services: "Multi-specialty Care, Surgery, Laboratory Services", rating: 4.5, hours: "8:00 AM - 8:00 PM" },
  { name: "Pet Care Clinic Namakkal", district: "Namakkal", address: "Trichy Road, Namakkal, Tamil Nadu 637002", phone: "+91 98765 43243", latitude: 11.2267, longitude: 78.1598, services: "Vaccination, Health Checkup, Emergency Care", rating: 4.3, hours: "9:00 AM - 7:00 PM" },
  { name: "Animal Hospital Rasipuram", district: "Namakkal", address: "Salem Road, Rasipuram, Namakkal, Tamil Nadu 637408", phone: "+91 98765 43244", latitude: 11.4667, longitude: 78.1833, services: "Rural Veterinary Care, Livestock Treatment, Pet Care", rating: 4.6, hours: "8:00 AM - 6:00 PM" },
  { name: "Government Veterinary Hospital Namakkal", district: "Namakkal", address: "Government Hospital Road, Namakkal, Tamil Nadu 637001", phone: "+91 98765 43245", latitude: 11.2156, longitude: 78.1645, services: "Government Services, Vaccination, Animal Health", rating: 4.2, hours: "9:00 AM - 5:00 PM" },
  { name: "Veterinary Clinic Tiruchengode", district: "Namakkal", address: "Erode Road, Tiruchengode, Namakkal, Tamil Nadu 637211", phone: "+91 98765 43246", latitude: 11.3833, longitude: 77.8833, services: "Pet Treatment, Surgery, Vaccination, Emergency Services", rating: 4.7, hours: "24/7 Emergency Care" },
  { name: "Animal Care Center Komarapalayam", district: "Namakkal", address: "Main Road, Komarapalayam, Namakkal, Tamil Nadu 638183", phone: "+91 98765 43247", latitude: 11.4444, longitude: 77.7111, services: "Pet Care, Grooming, Health Checkup, Pet Supplies", rating: 4.4, hours: "9:00 AM - 8:00 PM" },
  { name: "Namakkal Pet Hospital", district: "Namakkal", address: "Anna Nagar, Namakkal, Tamil Nadu 637003", phone: "+91 98765 43248", latitude: 11.2278, longitude: 78.1567, services: "Comprehensive Pet Care, Surgery, Dental Care, X-Ray", rating: 4.8, hours: "8:00 AM - 9:00 PM" },
  { name: "Veterinary Hospital Sendamangalam", district: "Namakkal", address: "Sendamangalam, Namakkal, Tamil Nadu 637404", phone: "+91 98765 43249", latitude: 11.5167, longitude: 78.2833, services: "Rural Pet Care, Livestock Services, Emergency Care", rating: 4.1, hours: "8:00 AM - 6:00 PM" },

  // Dharmapuri
  { name: "Dharmapuri Veterinary Hospital", district: "Dharmapuri", address: "Hospital Road, Dharmapuri, Tamil Nadu 636701", phone: "+91 98765 43250", latitude: 12.1211, longitude: 78.1583, services: "Multi-specialty Care, Surgery, Emergency Services", rating: 4.4, hours: "8:00 AM - 8:00 PM" },
  { name: "Pet Care Clinic Dharmapuri", district: "Dharmapuri", address: "Salem Road, Dharmapuri, Tamil Nadu 636702", phone: "+91 98765 43251", latitude: 12.1267, longitude: 78.1598, services: "Vaccination, Health Checkup, Pet Grooming", rating: 4.2, hours: "9:00 AM - 7:00 PM" },
  { name: "Animal Hospital Krishnagiri", district: "Dharmapuri", address: "Bangalore Road, Krishnagiri, Dharmapuri, Tamil Nadu 635001", phone: "+91 98765 43252", latitude: 12.5186, longitude: 78.2137, services: "Pet Treatment, Surgery, Laboratory Services, X-Ray", rating: 4.6, hours: "24/7 Emergency Service" },
  { name: "Government Veterinary Hospital Dharmapuri", district: "Dharmapuri", address: "Collectorate Complex, Dharmapuri, Tamil Nadu 636701", phone: "+91 98765 43253", latitude: 12.1189, longitude: 78.1556, services: "Government Services, Vaccination, Animal Health Programs", rating: 4.0, hours: "9:00 AM - 5:00 PM" },
  { name: "Veterinary Clinic Harur", district: "Dharmapuri", address: "Main Road, Harur, Dharmapuri, Tamil Nadu 636903", phone: "+91 98765 43254", latitude: 12.0500, longitude: 78.4833, services: "Rural Pet Care, Livestock Treatment, Emergency Care", rating: 4.3, hours: "8:00 AM - 6:00 PM" },
  { name: "Animal Care Center Palacode", district: "Dharmapuri", address: "Palacode, Dharmapuri, Tamil Nadu 636808", phone: "+91 98765 43255", latitude: 12.0333, longitude: 77.9167, services: "Pet Care, Vaccination, Health Checkup, Pet Supplies", rating: 4.5, hours: "9:00 AM - 8:00 PM" },
  { name: "Dharmapuri Pet Hospital", district: "Dharmapuri", address: "Bypass Road, Dharmapuri, Tamil Nadu 636703", phone: "+91 98765 43256", latitude: 12.1345, longitude: 78.1623, services: "Comprehensive Pet Care, Surgery, Dental Care, Boarding", rating: 4.7, hours: "8:00 AM - 9:00 PM" },
  { name: "Veterinary Hospital Pennagaram", district: "Dharmapuri", address: "Pennagaram, Dharmapuri, Tamil Nadu 636810", phone: "+91 98765 43257", latitude: 12.1333, longitude: 77.8833, services: "Rural Veterinary Care, Pet Treatment, Emergency Services", rating: 4.1, hours: "8:00 AM - 6:00 PM" },

  // Karur
  { name: "Karur Veterinary Hospital", district: "Karur", address: "Trichy Road, Karur, Tamil Nadu 639001", phone: "+91 98765 43258", latitude: 10.9601, longitude: 78.0766, services: "Multi-specialty Care, Surgery, Laboratory Services", rating: 4.5, hours: "8:00 AM - 8:00 PM" },
  { name: "Pet Care Clinic Karur", district: "Karur", address: "Dindigul Road, Karur, Tamil Nadu 639002", phone: "+91 98765 43259", latitude: 10.9578, longitude: 78.0823, services: "Vaccination, Health Checkup, Pet Grooming, Emergency Care", rating: 4.3, hours: "9:00 AM - 7:00 PM" },
  { name: "Animal Hospital Kulithalai", district: "Karur", address: "Kulithalai, Karur, Tamil Nadu 639120", phone: "+91 98765 43260", latitude: 10.9333, longitude: 78.4167, services: "Rural Pet Care, Livestock Treatment, Vaccination", rating: 4.4, hours: "8:00 AM - 6:00 PM" },
  { name: "Government Veterinary Hospital Karur", district: "Karur", address: "Government Hospital Complex, Karur, Tamil Nadu 639001", phone: "+91 98765 43261", latitude: 10.9567, longitude: 78.0789, services: "Government Services, Vaccination, Animal Health", rating: 4.1, hours: "9:00 AM - 5:00 PM" },
  { name: "Veterinary Clinic Aravakurichi", district: "Karur", address: "Aravakurichi, Karur, Tamil Nadu 639202", phone: "+91 98765 43262", latitude: 10.8667, longitude: 78.1833, services: "Pet Treatment, Surgery, Emergency Care, Health Checkup", rating: 4.6, hours: "24/7 Emergency Service" },
  { name: "Animal Care Center Krishnarayapuram", district: "Karur", address: "Krishnarayapuram, Karur, Tamil Nadu 639115", phone: "+91 98765 43263", latitude: 11.1333, longitude: 78.2167, services: "Pet Care, Grooming, Pet Supplies, Vaccination", rating: 4.2, hours: "9:00 AM - 8:00 PM" },
  { name: "Karur Pet Hospital", district: "Karur", address: "Velayuthampalayam, Karur, Tamil Nadu 639003", phone: "+91 98765 43264", latitude: 10.9623, longitude: 78.0745, services: "Comprehensive Pet Care, Surgery, Dental Care, X-Ray", rating: 4.8, hours: "8:00 AM - 9:00 PM" },
  { name: "Veterinary Hospital Manapparai", district: "Karur", address: "Manapparai, Karur, Tamil Nadu 621306", phone: "+91 98765 43265", latitude: 10.6167, longitude: 78.4333, services: "Rural Veterinary Care, Pet Treatment, Emergency Services", rating: 4.3, hours: "8:00 AM - 6:00 PM" },

  // ===== Additional districts (from seed_more*.js) =====
  // Chennai
  { name: "Government Veterinary Hospital Vepery", district: "Chennai", address: "Vepery, Chennai, Tamil Nadu 600007", phone: "+91 44 2530 4000", latitude: 13.0815, longitude: 80.2573, services: "OPD, Surgery, Vaccination, Emergency", rating: 4.6, hours: "9:00 AM - 8:00 PM, Emergency Support" },
  { name: "Madras Veterinary College Teaching Hospital", district: "Chennai", address: "IVC Road, Vepery, Chennai, Tamil Nadu 600007", phone: "+91 44 2538 1714", latitude: 13.0810, longitude: 80.2560, services: "Teaching Hospital, Diagnostics, Critical Care, Pharmacy", rating: 4.7, hours: "24/7 Emergency" },

  // Madurai
  { name: "Government Veterinary Hospital Madurai", district: "Madurai", address: "Anna Nagar, Madurai, Tamil Nadu 625020", phone: "+91 452 245 0000", latitude: 9.9390, longitude: 78.1215, services: "OPD, Vaccination, Surgery, Laboratory", rating: 4.5, hours: "9:00 AM - 8:00 PM" },
  { name: "Madurai Pet Clinic", district: "Madurai", address: "KK Nagar, Madurai, Tamil Nadu 625020", phone: "+91 98941 23456", latitude: 9.9398, longitude: 78.1145, services: "Pet Care, Dental, Grooming, Vaccination", rating: 4.3, hours: "9:00 AM - 9:00 PM" },

  // Tiruchirappalli
  { name: "Government Veterinary Hospital Trichy", district: "Tiruchirappalli", address: "Williams Road, Cantonment, Tiruchirappalli, Tamil Nadu 620001", phone: "+91 431 241 0000", latitude: 10.8052, longitude: 78.6854, services: "Government Services, Surgery, Vaccination, X-Ray", rating: 4.4, hours: "9:00 AM - 6:00 PM" },
  { name: "Trichy Pet Care Hospital", district: "Tiruchirappalli", address: "Thillai Nagar, Trichy, Tamil Nadu 620018", phone: "+91 97870 11223", latitude: 10.8130, longitude: 78.6812, services: "General Practice, Surgery, Ultrasound, Pharmacy", rating: 4.6, hours: "9:00 AM - 9:00 PM" },

  // Vellore
  { name: "Government Veterinary Hospital Vellore", district: "Vellore", address: "Officer's Line, Kosapet, Vellore, Tamil Nadu 632001", phone: "+91 416 222 0000", latitude: 12.9166, longitude: 79.1322, services: "Government Services, OPD, Surgery, Vaccination", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Vellore Pet Clinic", district: "Vellore", address: "Gandhinagar, Vellore, Tamil Nadu 632006", phone: "+91 97910 22334", latitude: 12.9367, longitude: 79.1552, services: "Pet Care, Diagnostics, Grooming, Vaccination", rating: 4.3, hours: "10:00 AM - 8:00 PM" },

  // Kancheepuram
  { name: "Government Veterinary Hospital Kanchipuram", district: "Kancheepuram", address: "Railway Station Rd, Ennaikaran, Kanchipuram, Tamil Nadu 631501", phone: "+91 44 2722 0000", latitude: 12.8353, longitude: 79.7038, services: "Government Services, Vaccination, Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Kanchipuram Pet Care", district: "Kancheepuram", address: "Kailasanathar Koil St, Kanchipuram, Tamil Nadu 631502", phone: "+91 98948 55667", latitude: 12.8392, longitude: 79.7032, services: "General Pet Care, Grooming, Pharmacy", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Dindigul
  { name: "Government Veterinary Hospital Dindigul", district: "Dindigul", address: "AMC Rd, Dindigul, Tamil Nadu 624001", phone: "+91 451 246 0000", latitude: 10.3689, longitude: 77.9801, services: "OPD, Surgery, Vaccination, Laboratory", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Dindigul Pet Clinic", district: "Dindigul", address: "Begambur, Dindigul, Tamil Nadu 624002", phone: "+91 97900 77889", latitude: 10.3650, longitude: 77.9757, services: "General Veterinary, Grooming, Vaccination", rating: 4.3, hours: "9:00 AM - 8:00 PM" },

  // Thanjavur
  { name: "Government Veterinary Hospital Thanjavur", district: "Thanjavur", address: "Medical College Rd, Thanjavur, Tamil Nadu 613004", phone: "+91 4362 240 000", latitude: 10.7871, longitude: 79.1376, services: "Government Services, Surgery, Vaccination", rating: 4.3, hours: "9:00 AM - 6:00 PM" },
  { name: "Thanjavur Pet Care Clinic", district: "Thanjavur", address: "Srinivasapuram, Thanjavur, Tamil Nadu 613009", phone: "+91 98421 11223", latitude: 10.7896, longitude: 79.1312, services: "Pet Care, Diagnostics, Vaccination", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Thoothukudi
  { name: "Government Veterinary Hospital Thoothukudi", district: "Thoothukudi", address: "Millerpuram, Thoothukudi, Tamil Nadu 628008", phone: "+91 461 232 0000", latitude: 8.7878, longitude: 78.1540, services: "Government Services, OPD, Vaccination", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Tuticorin Pet Clinic", district: "Thoothukudi", address: "Palai Rd, Thoothukudi, Tamil Nadu 628002", phone: "+91 97860 33445", latitude: 8.8037, longitude: 78.1541, services: "Pet Care, Grooming, Pharmacy", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Tirunelveli
  { name: "Government Veterinary Hospital Tirunelveli", district: "Tirunelveli", address: "Palayamkottai, Tirunelveli, Tamil Nadu 627002", phone: "+91 462 256 0000", latitude: 8.7332, longitude: 77.7088, services: "Government Services, Surgery, Vaccination", rating: 4.3, hours: "9:00 AM - 6:00 PM" },
  { name: "Tirunelveli Pet Clinic", district: "Tirunelveli", address: "Melapalayam, Tirunelveli, Tamil Nadu 627005", phone: "+91 98423 55667", latitude: 8.7112, longitude: 77.7482, services: "General Pet Care, Grooming, Vaccination", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // The Nilgiris
  { name: "Government Veterinary Hospital Ooty", district: "The Nilgiris", address: "Stone House Hill, Ooty, Tamil Nadu 643001", phone: "+91 423 244 0000", latitude: 11.4066, longitude: 76.6930, services: "Government Services, OPD, Vaccination", rating: 4.4, hours: "9:00 AM - 6:00 PM" },
  { name: "Ooty Pet Care", district: "The Nilgiris", address: "Charing Cross, Ooty, Tamil Nadu 643001", phone: "+91 96290 77889", latitude: 11.4112, longitude: 76.6952, services: "Pet Care, Diagnostics, Grooming, Vaccination", rating: 4.5, hours: "9:30 AM - 8:30 PM" },

  // Kanniyakumari
  { name: "Government Veterinary Hospital Nagercoil", district: "Kanniyakumari", address: "Court Rd, Nagercoil, Tamil Nadu 629001", phone: "+91 4652 230 000", latitude: 8.1786, longitude: 77.4282, services: "Government Services, OPD, Surgery, Vaccination", rating: 4.3, hours: "9:00 AM - 6:00 PM" },
  { name: "Kanyakumari Pet Clinic", district: "Kanniyakumari", address: "Vadasery, Nagercoil, Tamil Nadu 629001", phone: "+91 97910 88990", latitude: 8.1907, longitude: 77.4323, services: "General Pet Care, Grooming, Vaccination", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // ===== Batch 2 =====
  // Ariyalur
  { name: "Government Veterinary Hospital Ariyalur", district: "Ariyalur", address: "Kamarajar Salai, Ariyalur, Tamil Nadu 621704", phone: "+91 4329 222 100", latitude: 11.1390, longitude: 79.0750, services: "OPD, Vaccination, Minor Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Ariyalur Pet Care Clinic", district: "Ariyalur", address: "Railway Station Rd, Ariyalur, Tamil Nadu 621704", phone: "+91 96291 22331", latitude: 11.1460, longitude: 79.0880, services: "Pet Care, Grooming, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Chengalpattu
  { name: "Government Veterinary Hospital Chengalpattu", district: "Chengalpattu", address: "GST Rd, Chengalpattu, Tamil Nadu 603001", phone: "+91 44 2722 1100", latitude: 12.6876, longitude: 79.9839, services: "Government Services, Vaccination, Surgery", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Chengalpattu Pet Clinic", district: "Chengalpattu", address: "Mahindra City Rd, Chengalpattu, Tamil Nadu 603004", phone: "+91 97912 88990", latitude: 12.7400, longitude: 80.0100, services: "OPD, Grooming, General Treatment", rating: 4.3, hours: "9:30 AM - 8:30 PM" },

  // Cuddalore
  { name: "Government Veterinary Hospital Cuddalore", district: "Cuddalore", address: "Imperial Rd, Manjakuppam, Cuddalore, Tamil Nadu 607001", phone: "+91 4142 222 300", latitude: 11.7463, longitude: 79.7680, services: "OPD, Vaccination, Animal Birth Control", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Cuddalore Pet Care", district: "Cuddalore", address: "Thirupapuliyur, Cuddalore, Tamil Nadu 607002", phone: "+91 97890 11223", latitude: 11.7488, longitude: 79.7595, services: "Pet Care, Diagnostics, Grooming", rating: 4.3, hours: "9:30 AM - 8:30 PM" },

  // Kallakurichi
  { name: "Government Veterinary Hospital Kallakurichi", district: "Kallakurichi", address: "Salem Main Rd, Kallakurichi, Tamil Nadu 606202", phone: "+91 4151 222 500", latitude: 11.7400, longitude: 78.9600, services: "Government Services, Vaccination, Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Kallakurichi Pet Clinic", district: "Kallakurichi", address: "Sankarapuram Rd, Kallakurichi, Tamil Nadu 606202", phone: "+91 96290 66778", latitude: 11.7550, longitude: 79.0000, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Krishnagiri
  { name: "Government Veterinary Hospital Krishnagiri", district: "Krishnagiri", address: "Bangalore Rd, Krishnagiri, Tamil Nadu 635001", phone: "+91 4343 222 900", latitude: 12.5192, longitude: 78.2138, services: "OPD, Surgery, Vaccination", rating: 4.3, hours: "9:00 AM - 6:00 PM" },
  { name: "Krishnagiri Pet Clinic", district: "Krishnagiri", address: "Rayakottai Rd, Krishnagiri, Tamil Nadu 635001", phone: "+91 98943 55667", latitude: 12.5260, longitude: 78.2145, services: "Pet Care, Diagnostics, Grooming", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Mayiladuthurai
  { name: "Government Veterinary Hospital Mayiladuthurai", district: "Mayiladuthurai", address: "Poompuhar Rd, Mayiladuthurai, Tamil Nadu 609001", phone: "+91 4364 220 100", latitude: 11.1010, longitude: 79.6520, services: "OPD, Vaccination, Minor Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Mayiladuthurai Pet Clinic", district: "Mayiladuthurai", address: "Koranad, Mayiladuthurai, Tamil Nadu 609002", phone: "+91 96292 33445", latitude: 11.1100, longitude: 79.6550, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Nagapattinam
  { name: "Government Veterinary Hospital Nagapattinam", district: "Nagapattinam", address: "Court Rd, Nagapattinam, Tamil Nadu 611001", phone: "+91 4365 222 200", latitude: 10.7638, longitude: 79.8449, services: "OPD, Vaccination, Fisheries Support", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Nagapattinam Pet Care", district: "Nagapattinam", address: "Velankanni Rd, Nagapattinam, Tamil Nadu 611001", phone: "+91 97912 22331", latitude: 10.7750, longitude: 79.8400, services: "Pet Care, Grooming, General Treatment", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Perambalur
  { name: "Government Veterinary Hospital Perambalur", district: "Perambalur", address: "Trichy Main Rd, Perambalur, Tamil Nadu 621212", phone: "+91 4328 222 400", latitude: 11.2340, longitude: 78.8840, services: "OPD, Vaccination, Rural Services", rating: 4.0, hours: "9:00 AM - 6:00 PM" },
  { name: "Perambalur Pet Clinic", district: "Perambalur", address: "NH Service Rd, Perambalur, Tamil Nadu 621212", phone: "+91 96290 77889", latitude: 11.2400, longitude: 78.8900, services: "Pet Care, Pharmacy", rating: 4.1, hours: "10:00 AM - 8:00 PM" },

  // Pudukkottai
  { name: "Government Veterinary Hospital Pudukkottai", district: "Pudukkottai", address: "Avudaiyarkoil Rd, Pudukkottai, Tamil Nadu 622001", phone: "+91 4322 222 300", latitude: 10.3797, longitude: 78.8208, services: "OPD, Surgery, Vaccination", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Pudukkottai Pet Care", district: "Pudukkottai", address: "East 2nd St, Pudukkottai, Tamil Nadu 622001", phone: "+91 97912 55667", latitude: 10.3810, longitude: 78.8210, services: "General Pet Care, Grooming", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Ramanathapuram
  { name: "Government Veterinary Hospital Ramanathapuram", district: "Ramanathapuram", address: "Madurai Rd, Ramanathapuram, Tamil Nadu 623501", phone: "+91 4567 222 100", latitude: 9.3716, longitude: 78.8308, services: "OPD, Vaccination, Rural Services", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Ramanathapuram Pet Clinic", district: "Ramanathapuram", address: "Salai St, Ramanathapuram, Tamil Nadu 623501", phone: "+91 96291 88990", latitude: 9.3740, longitude: 78.8330, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // ===== Batch 3 =====
  // Ranipet
  { name: "Government Veterinary Hospital Ranipet", district: "Ranipet", address: "Arakkonam Rd, Ranipet, Tamil Nadu 632401", phone: "+91 4172 220 100", latitude: 12.9410, longitude: 79.3330, services: "OPD, Vaccination, Minor Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Ranipet Pet Clinic", district: "Ranipet", address: "Walajapet, Ranipet, Tamil Nadu 632513", phone: "+91 96290 33445", latitude: 12.9185, longitude: 79.3215, services: "General Pet Care, Grooming, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Sivaganga
  { name: "Government Veterinary Hospital Sivaganga", district: "Sivaganga", address: "Kalasalingam Rd, Sivaganga, Tamil Nadu 630561", phone: "+91 4575 220 200", latitude: 9.8470, longitude: 78.4840, services: "OPD, Vaccination, Rural Services", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Sivaganga Pet Clinic", district: "Sivaganga", address: "Manamadurai Rd, Sivaganga, Tamil Nadu 630562", phone: "+91 97913 66778", latitude: 9.8520, longitude: 78.5020, services: "Pet Care, Grooming", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Tenkasi
  { name: "Government Veterinary Hospital Tenkasi", district: "Tenkasi", address: "Courtallam Rd, Tenkasi, Tamil Nadu 627811", phone: "+91 4633 220 300", latitude: 8.9590, longitude: 77.3150, services: "OPD, Vaccination, Surgery", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Tenkasi Pet Clinic", district: "Tenkasi", address: "Vickramasingapuram Rd, Tenkasi, Tamil Nadu 627814", phone: "+91 96292 77889", latitude: 8.9700, longitude: 77.3190, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Theni
  { name: "Government Veterinary Hospital Theni", district: "Theni", address: "Cumbum Rd, Theni, Tamil Nadu 625531", phone: "+91 4546 220 400", latitude: 10.0115, longitude: 77.4760, services: "OPD, Vaccination, Surgery", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Theni Pet Clinic", district: "Theni", address: "Andipatti Rd, Theni, Tamil Nadu 625512", phone: "+91 97912 11223", latitude: 10.0020, longitude: 77.4800, services: "General Pet Care, Grooming", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Tirupathur
  { name: "Government Veterinary Hospital Tirupathur", district: "Tirupathur", address: "Vaniyambadi Rd, Tirupathur, Tamil Nadu 635601", phone: "+91 4179 220 100", latitude: 12.4980, longitude: 78.5710, services: "OPD, Vaccination, Minor Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Tirupathur Pet Clinic", district: "Tirupathur", address: "Ambur Rd, Tirupathur, Tamil Nadu 635602", phone: "+91 96293 55667", latitude: 12.4945, longitude: 78.5780, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Tiruvallur
  { name: "Government Veterinary Hospital Tiruvallur", district: "Tiruvallur", address: "SH 50, Tiruvallur, Tamil Nadu 602001", phone: "+91 44 2766 2200", latitude: 13.1445, longitude: 79.9088, services: "OPD, Surgery, Vaccination", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Tiruvallur Pet Clinic", district: "Tiruvallur", address: "Veeraraghava Perumal Sannathi St, Tiruvallur, Tamil Nadu 602001", phone: "+91 97914 22331", latitude: 13.1440, longitude: 79.9095, services: "General Pet Care, Grooming", rating: 4.2, hours: "9:30 AM - 8:30 PM" },

  // Tiruvannamalai
  { name: "Government Veterinary Hospital Tiruvannamalai", district: "Tiruvannamalai", address: "Polur Rd, Tiruvannamalai, Tamil Nadu 606601", phone: "+91 4175 220 400", latitude: 12.2295, longitude: 79.0747, services: "OPD, Surgery, Vaccination", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Tiruvannamalai Pet Clinic", district: "Tiruvannamalai", address: "Ramana Nagar, Tiruvannamalai, Tamil Nadu 606603", phone: "+91 96294 88990", latitude: 12.2250, longitude: 79.0790, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Tiruvarur
  { name: "Government Veterinary Hospital Tiruvarur", district: "Tiruvarur", address: "Railway Station Rd, Tiruvarur, Tamil Nadu 610001", phone: "+91 4366 220 300", latitude: 10.7720, longitude: 79.6360, services: "OPD, Vaccination, Surgery", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Tiruvarur Pet Clinic", district: "Tiruvarur", address: "VK Rd, Tiruvarur, Tamil Nadu 610001", phone: "+91 97915 77889", latitude: 10.7750, longitude: 79.6400, services: "General Pet Care, Grooming", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Viluppuram
  { name: "Government Veterinary Hospital Viluppuram", district: "Viluppuram", address: "Mundiyampakkam Rd, Viluppuram, Tamil Nadu 605602", phone: "+91 4146 220 200", latitude: 11.9330, longitude: 79.4920, services: "OPD, Vaccination, Surgery", rating: 4.1, hours: "9:00 AM - 6:00 PM" },
  { name: "Viluppuram Pet Clinic", district: "Viluppuram", address: "Keezhperambai Rd, Viluppuram, Tamil Nadu 605602", phone: "+91 96296 22331", latitude: 11.9440, longitude: 79.5005, services: "General Pet Care, Pharmacy", rating: 4.2, hours: "10:00 AM - 8:00 PM" },

  // Virudhunagar
  { name: "Government Veterinary Hospital Virudhunagar", district: "Virudhunagar", address: "Virudhunagar Main Rd, Virudhunagar, Tamil Nadu 626001", phone: "+91 4562 220 100", latitude: 9.5850, longitude: 77.9570, services: "OPD, Vaccination, Surgery", rating: 4.2, hours: "9:00 AM - 6:00 PM" },
  { name: "Virudhunagar Pet Clinic", district: "Virudhunagar", address: "Sivakasi Rd, Virudhunagar, Tamil Nadu 626001", phone: "+91 97917 88990", latitude: 9.5920, longitude: 77.9620, services: "General Pet Care, Grooming", rating: 4.2, hours: "10:00 AM - 8:00 PM" }
];

// Pricing catalog to infer costs from free-text `services`
const PRICING_CATALOG = [
  { key: 'vaccination', name: 'Vaccination', price: 500, unit: 'dose' },
  { key: 'groom', name: 'Grooming', price: 800, unit: 'session' },
  { key: 'consult', name: 'Consultation', price: 300, unit: 'visit' },
  { key: 'checkup', name: 'Health Checkup', price: 400, unit: 'visit' },
  { key: 'deworm', name: 'Deworming', price: 400, unit: 'dose' },
  { key: 'dental', name: 'Dental Care', price: 1200, unit: 'session' },
  { key: 'x-ray', name: 'X-Ray', price: 800, unit: 'scan' },
  { key: 'ultrasound', name: 'Ultrasound', price: 1200, unit: 'scan' },
  { key: 'surgery', name: 'Surgery', price: 3000, unit: 'procedure' },
  { key: 'emergency', name: 'Emergency', price: 1000, unit: 'visit' },
  { key: 'boarding', name: 'Boarding', price: 700, unit: 'day' },
  { key: 'training', name: 'Training', price: 600, unit: 'session' },
  { key: 'microchip', name: 'Microchipping', price: 1000, unit: 'procedure' },
  { key: 'pharmacy', name: 'Pharmacy', price: 0 },
  { key: 'telemedicine', name: 'Telemedicine', price: 350, unit: 'consult' },
  { key: 'rescue', name: 'Animal Rescue', price: 0 },
  { key: 'abc', name: 'Birth Control (ABC)', price: 2500, unit: 'procedure' }
];

function buildServiceDetailsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const parts = text.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
  const mapped = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    const match = PRICING_CATALOG.find(p => lower.includes(p.key));
    if (match) {
      mapped.push({ name: match.name, price: match.price ?? null, currency: 'INR', unit: match.unit });
    } else {
      // keep unknown service without price, display name as-is
      mapped.push({ name: part, price: null, currency: 'INR' });
    }
  }
  // de-duplicate by name
  const unique = [];
  const seen = new Set();
  for (const item of mapped) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(item); }
  }
  // If nothing matched, provide sensible defaults so costs always show
  if (unique.length === 0) {
    return [
      { name: 'Consultation', price: 300, currency: 'INR', unit: 'visit' },
      { name: 'Vaccination', price: 500, currency: 'INR', unit: 'dose' }
    ];
  }
  return unique;
}

async function seedAll() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB (seed_all)");

    await Service.deleteMany({});
    console.log("Cleared existing services");

    // Ensure every center has non-empty serviceDetails with prices
    const centersWithDetails = allCenters.map(c => {
      const hasDetails = Array.isArray(c.serviceDetails) && c.serviceDetails.length > 0;
      const details = hasDetails ? c.serviceDetails : buildServiceDetailsFromText(c.services);
      return { ...c, serviceDetails: details };
    });

    const inserted = await Service.insertMany(centersWithDetails);
    console.log(`Inserted ${inserted.length} total centers across Tamil Nadu`);

    const counts = await Service.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log("\nTotals by district:");
    counts.forEach(({ _id, count }) => console.log(`${_id}: ${count} centers`));

    console.log("\nAll centers seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("seed_all error:", err?.message || err);
    process.exit(1);
  }
}

seedAll();
