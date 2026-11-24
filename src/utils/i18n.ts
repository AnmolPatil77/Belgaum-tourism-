import type { LanguageCode } from '../types/belagavi';

export interface Translations {
  brand: string;
  nav: {
    destinations: string;
    map: string;
    stays: string;
    culture: string;
    gallery: string;
    planTrip: string;
    admin: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    ctaExplore: string;
    ctaPlan: string;
  };
  sections: {
    destinationsTitle: string;
    destinationsSub: string;
    mapTitle: string;
    mapSub: string;
    staysTitle: string;
    staysSub: string;
    cultureTitle: string;
    cultureSub: string;
    galleryTitle: string;
    gallerySub: string;
    reviewsTitle: string;
    reviewsSub: string;
    plannerTitle: string;
    plannerSub: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  EN: {
    brand: 'Belagavi',
    nav: {
      destinations: 'Destinations',
      map: 'Interactive Map',
      stays: 'Stays & Rooms',
      culture: 'Food & Culture',
      gallery: 'Photo Gallery',
      planTrip: 'Plan Your Trip',
      admin: 'Admin Dashboard',
    },
    hero: {
      kicker: 'Karnataka · Western Ghats Heritage Monograph',
      headline: 'Discover Belagavi: Land of Waterfalls, Forts & Timeless Culture',
      subheadline:
        'Explore the cultural crossroads of Karnataka, Maharashtra, and Goa—from 12th-century Ratta dynasty forts and boutique forest stays to iconic Kunda and Gokak Falls.',
      ctaExplore: 'Explore Belagavi',
      ctaPlan: 'Plan Your Trip & Stay',
    },
    sections: {
      destinationsTitle: 'Landmarks, Forts & Waterfalls',
      destinationsSub:
        'Six curated heritage sites and Western Ghats cascades anchored around Belagavi, with exact GPS coordinates and route sync.',
      mapTitle: 'Interactive Belagavi Map & Route Visualizer',
      mapSub:
        'Toggle destinations, stays, and culinary spots across Belagavi. Selecting multiple places automatically charts your driving route and distance.',
      staysTitle: 'Curated Stays & Hotel Rooms',
      staysSub:
        'From five-star hill retreats in Kakati to Malnad heritage eco-homestays bordering Bhimgad Sanctuary.',
      cultureTitle: 'Local Food, Traditional Art & Cultural Activities',
      cultureSub:
        'Bookmark authentic culinary specialties, artisan crafts, and regional festivals directly into your custom Belagavi trip dossier.',
      galleryTitle: 'Belagavi Visual Archive',
      gallerySub:
        'Monsoon gorges, carved basalt sanctums, culinary traditions, and serene forest properties.',
      reviewsTitle: 'Visitor Stories & Field Notes',
      reviewsSub:
        'First-hand reflections from travelers who explored Belagavi’s forts, falls, and stays.',
      plannerTitle: 'Plan Your Belagavi Trip & Stay',
      plannerSub:
        'Build your custom itinerary with live INR budget estimation, driving distance calculation, and instant Booking Pass generation.',
    },
  },
  KN: {
    brand: 'ಬೆಳಗಾವಿ',
    nav: {
      destinations: 'ಪ್ರವಾಸಿ ತಾಣಗಳು',
      map: 'ನಕ್ಷೆ ಮತ್ತು ಮಾರ್ಗ',
      stays: 'ವಸತಿ ಮತ್ತು ಹೋಟೆಲ್',
      culture: 'ಆಹಾರ ಮತ್ತು ಸಂಸ್ಕೃತಿ',
      gallery: 'ಛಾಯಾಚಿತ್ರ ಗ್ಯಾಲರಿ',
      planTrip: 'ಪ್ರವಾಸ ಯೋಜಿಸಿ',
      admin: 'ನಿರ್ವಹಣೆ',
    },
    hero: {
      kicker: 'ಕರ್ನಾಟಕ · ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಪಾರಂಪರಿಕ ಪ್ರವಾಸ',
      headline: 'ಬೆಳಗಾವಿಯನ್ನು ಅನ್ವೇಷಿಸಿ: ಜಲಪಾತಗಳು, ಕೋಟೆಗಳು ಮತ್ತು ಶಾಶ್ವತ ಸಂಸ್ಕೃತಿಯ ನಾಡು',
      subheadline:
        'ಕರ್ನಾಟಕ, ಮಹಾರಾಷ್ಟ್ರ ಮತ್ತು ಗೋವಾದ ಸಾಂಸ್ಕೃತಿಕ ಸಂಗಮ—12ನೇ ಶತಮಾನದ ರಟ್ಟರ ಕೋಟೆಗಳು, ಪ್ರಕೃತಿ ರೆಸಾರ್ಟ್‌ಗಳು, ಪ್ರಸಿದ್ಧ ಕುಂದಾ ಮತ್ತು ಗೋಕಾಕ್ ಜಲಪಾತ.',
      ctaExplore: 'ಬೆಳಗಾವಿ ನೋಡಿ',
      ctaPlan: 'ಪ್ರವಾಸ ಮತ್ತು ವಸತಿ ಯೋಜಿಸಿ',
    },
    sections: {
      destinationsTitle: 'ಕೋಟೆಗಳು, ಜಲಪಾತಗಳು ಮತ್ತು ಪಾರಂಪರಿಕ ತಾಣಗಳು',
      destinationsSub:
        'ಬೆಳಗಾವಿಯ ಆರು ಪ್ರಮುಖ ಪ್ರವಾಸಿ ತಾಣಗಳು, ನಿಖರವಾದ GPS ನಿರ್ದೇಶಾಂಕಗಳು ಮತ್ತು ಮಾರ್ಗ ಯೋಜನೆಯೊಂದಿಗೆ.',
      mapTitle: 'ಬೆಳಗಾವಿ ಸಂವಾದಾತ್ಮಕ ನಕ್ಷೆ ಮತ್ತು ಮಾರ್ಗ ದರ್ಶಿ',
      mapSub:
        'ಪ್ರವಾಸಿ ತಾಣಗಳು, ಹೋಟೆಲ್‌ಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಆಹಾರ ಕೇಂದ್ರಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ ಹಾಗೂ ಪ್ರಯಾಣದ ದೂರವನ್ನು ಲೆಕ್ಕಹಾಕಿ.',
      staysTitle: 'ಆಯ್ದ ವಸತಿ ಮತ್ತು ಹೋಟೆಲ್ ಕೊಠಡಿಗಳು',
      staysSub:
        'ಕಾಕತಿಯ ಪಂಚತಾರಾ ಹೋಟೆಲ್‌ಗಳಿಂದ ಖಾನಾಪುರದ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಪರಿಸರ ಹೋಂಸ್ಟೇಗಳವರೆಗೆ.',
      cultureTitle: 'ಸ್ಥಳೀಯ ಆಹಾರ, ಸಾಂಪ್ರದಾಯಿಕ ಕಲೆ ಮತ್ತು ಉತ್ಸವಗಳು',
      cultureSub:
        'ಬೆಳಗಾವಿ ಕುಂದಾ, ಗೋಕಾಕ್ ಕರದಂಟು, ಗೋಕಾಕ್ ಮರದ ಆಟಿಕೆಗಳು ಮತ್ತು ಕಿತ್ತೂರು ಉತ್ಸವವನ್ನು ನಿಮ್ಮ ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ.',
      galleryTitle: 'ಬೆಳಗಾವಿ ಛಾಯಾಚಿತ್ರ ಸಂಗ್ರಹ',
      gallerySub:
        'ಜಲಪಾತಗಳು, ಪ್ರಾಚೀನ ಕೋಟೆಗಳು, ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿಗಳು ಮತ್ತು ಹಸಿರು ವಸತಿ ತಾಣಗಳು.',
      reviewsTitle: 'ಪ್ರವಾಸಿಗರ ಅನುಭವಗಳು ಮತ್ತು ವಿಮರ್ಶೆಗಳು',
      reviewsSub:
        'ಬೆಳಗಾವಿಯ ಸೌಂದರ್ಯವನ್ನು ಅನುಭವಿಸಿದ ಪ್ರವಾಸಿಗರ ನೈಜ ಅಭಿಪ್ರಾಯಗಳು.',
      plannerTitle: 'ನಿಮ್ಮ ಬೆಳಗಾವಿ ಪ್ರವಾಸ ಮತ್ತು ವಸತಿ ಯೋಜಿಸಿ',
      plannerSub:
        'ಲೈವ್ ಬಜೆಟ್ ಲೆಕ್ಕಾಚಾರ, ಮಾರ್ಗದ ದೂರ ಮತ್ತು ತಕ್ಷಣದ ಟ್ರಿಪ್ ಪಾಸ್‌ನೊಂದಿಗೆ ನಿಮ್ಮ ಪ್ರವಾಸವನ್ನು ಬುಕ್ ಮಾಡಿ.',
    },
  },
  MR: {
    brand: 'बेळगाव',
    nav: {
      destinations: 'पर्यटन स्थळे',
      map: 'नकाशा व मार्ग',
      stays: 'निवास व हॉटेल्स',
      culture: 'खाद्य व संस्कृती',
      gallery: 'फोटो गॅलरी',
      planTrip: 'सहल नियोजन',
      admin: 'अ‍ॅडमिन डॅशबोर्ड',
    },
    hero: {
      kicker: 'कर्नाटक · पश्चिम घाटाचा सांस्कृतिक वारसा',
      headline: 'बेळगावची सफर: धबधबे, किल्ले आणि समृद्ध संस्कृतीची भूमी',
      subheadline:
        'कर्नाटक, महाराष्ट्र आणि गोव्याचा सांस्कृतिक संगम—१२व्या शतकातील रट्ट राजवंशाचे किल्ले, निसर्गरम्य निवास, प्रसिद्ध कुंदा आणि गोकाक धबधबा.',
      ctaExplore: 'बेळगाव पाहा',
      ctaPlan: 'सहल व निवास बुक करा',
    },
    sections: {
      destinationsTitle: 'किल्ले, धबधबे आणि ऐतिहासिक स्थळे',
      destinationsSub:
        'बेळगाव परिसरातील सहा प्रमुख पर्यटन स्थळे, अचूक GPS नकाशा व मार्ग नियोजनासह.',
      mapTitle: 'बेळगाव संवादात्मक नकाशा आणि मार्गदर्शक',
      mapSub:
        'पर्यटन स्थळे, हॉटेल्स आणि खाद्यपदार्थांची ठिकाणे निवडा व एकूण प्रवासाचे अंतर पहा.',
      staysTitle: 'निवडक हॉटेल्स आणि निसर्ग निवास',
      staysSub:
        'काकतीतील पंचतारांकित हॉटेल्सपासून खानापूरच्या पश्चिम घाटातील इको-होमस्टेपर्यंत.',
      cultureTitle: 'स्थानिक खाद्यसंस्कृती, पारंपरिक कला आणि उत्सव',
      cultureSub:
        'बेळगाव कुंदा, गोकाक करदंट, लाकडी खेळणी आणि सांस्कृतिक उत्सव तुमच्या सहलीत जोडा.',
      galleryTitle: 'बेळगाव छायाचित्र संग्रह',
      gallerySub:
        'धबधबे, प्राचीन किल्ले, अस्सल खाद्यपदार्थ आणि हिरव्यागार रिसॉर्ट्सची झलक.',
      reviewsTitle: 'पर्यटकांचे अनुभव आणि अभिप्राय',
      reviewsSub:
        'बेळगावच्या वारशाला भेट दिलेल्या पर्यटकांचे प्रामाणिक अनुभव.',
      plannerTitle: 'तुमची बेळगाव सहल आणि निवास नियोजित करा',
      plannerSub:
        'अंदाजित खर्च (₹), प्रवासाचे अंतर आणि तात्काळ ट्रिप पाससह तुमची सहल निश्चित करा.',
    },
  },
};
