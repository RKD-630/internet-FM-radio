// ==========================================================================
// RKD FM | CYBER RADIO DECK ENGINE
// ==========================================================================

// API Configurations
const API_ENDPOINTS = [
    'https://de1.api.radio-browser.info/json',
    'https://at1.api.radio-browser.info/json',
    'https://nl1.api.radio-browser.info/json',
    'https://fr1.api.radio-browser.info/json'
];
let currentApiIndex = 0;
let API_BASE = API_ENDPOINTS[currentApiIndex];
let retryCount = 0;

const DEFAULT_LIMIT = 200;
const DEFAULT_LOGO = 'logo.png';

const CUSTOM_SINGER_STATIONS = [
    {
        stationuuid: 'custom-kishore-kumar-radio',
        name: 'Kishore Kumar Radio',
        url_resolved: 'https://stream.zeno.fm/0ghtfp8ztm0uv',
        favicon: 'https://radiosindia.com/images/kishorekumarradio.jpg',
        country: 'India',
        tags: 'singer, kishore kumar, hindi, classics, bollywood',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-lata-mangeshkar-radio',
        name: 'Lata Mangeshkar Radio',
        url_resolved: 'https://stream.zeno.fm/87xam8pf7tzuv',
        favicon: 'https://radiosindia.com/images/latamangeshkarradio.jpg',
        country: 'India',
        tags: 'singer, lata mangeshkar, hindi, melodies, classics',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-mohammed-rafi-radio',
        name: 'Mohammed Rafi Hits',
        url_resolved: 'https://stream.zeno.fm/65q831c260hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/mohammed-rafi.jpg',
        country: 'India',
        tags: 'singer, mohammed rafi, hindi, classics, oldies',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-arijit-singh-radio',
        name: 'Arijit Singh Hits',
        url_resolved: 'https://stream.zeno.fm/w062e7pf7tzuv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/arijit-singh.jpg',
        country: 'India',
        tags: 'singer, arijit singh, hindi, romantic, bollywood',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-asha-bhosle-radio',
        name: 'Asha Bhosle Hits',
        url_resolved: 'https://stream.zeno.fm/f2wvbbscrs8uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/asha-bhosle.jpg',
        country: 'India',
        tags: 'singer, asha bhosle, hindi, classics, retro',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-mukesh-hits',
        name: 'Mukesh Golden Hits',
        url_resolved: 'https://stream.zeno.fm/g95zm67prfhvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/mukesh.jpg',
        country: 'India',
        tags: 'singer, mukesh, hindi, classics, oldies',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-kumar-sanu-radio',
        name: 'Kumar Sanu Hits',
        url_resolved: 'https://stream.zeno.fm/4r530f2a9f0uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/kumar-sanu.jpg',
        country: 'India',
        tags: 'singer, kumar sanu, 90s, hindi, romance',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-udit-narayan-radio',
        name: 'Udit Narayan Hits',
        url_resolved: 'https://stream.zeno.fm/54ecvca0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/udit-narayan.jpg',
        country: 'India',
        tags: 'singer, udit narayan, 90s, hindi, bollywood',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-alka-yagnik-radio',
        name: 'Alka Yagnik Radio',
        url_resolved: 'https://stream.zeno.fm/k2k4vbbscrs8uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/alka-yagnik.jpg',
        country: 'India',
        tags: 'singer, alka yagnik, 90s, hindi, melodies',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-rd-burman-radio',
        name: 'RD Burman Magic',
        url_resolved: 'https://stream.zeno.fm/epylmeu4zf7vv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/rd-burman.jpg',
        country: 'India',
        tags: 'singer, rd burman, pancham, classics',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-sonu-nigam-radio',
        name: 'Sonu Nigam Special',
        url_resolved: 'https://stream.zeno.fm/g3w1cca0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/sonu-nigam.jpg',
        country: 'India',
        tags: 'singer, sonu nigam, hindi, romantic',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-ar-rahman-radio',
        name: 'AR Rahman Hits',
        url_resolved: 'https://stream.zeno.fm/w0k0cda0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/ar-rahman.jpg',
        country: 'India',
        tags: 'singer, ar rahman, hindi, melody, hits',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-jagjit-singh-radio',
        name: 'Jagjit Singh Ghazals',
        url_resolved: 'https://stream.zeno.fm/syu0rdutvxhvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/jagjit-singh.jpg',
        country: 'India',
        tags: 'singer, ghazal, jagjit singh, hindi',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-easy-96-radio',
        name: 'Easy 96 Radio',
        url_resolved: 'https://ice8.securenetsystems.net/EASY96',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/easy-96-radio.jpg',
        country: 'India',
        tags: 'singer, hindi, easy 96, classics',
        lastcheckok: 1
    }
];

const CUSTOM_GHAZAL_STATIONS = [
    {
        stationuuid: 'custom-easy-punjabi-radio',
        name: 'Easy Punjabi Radio',
        url_resolved: 'https://ice24.securenetsystems.net/CKYE',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/easy-96-radio.jpg',
        country: 'India',
        tags: 'ghazal, punjabi, easy punjabi, poetry, melody, classic',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-punjabi-ghazal-sufi',
        name: 'Punjabi Ghazal & Sufi FM',
        url_resolved: 'https://stream.zeno.fm/0ghtfp8ztm0uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/sufi-ghazal.jpg',
        country: 'India',
        tags: 'ghazal, punjabi, sufi, poetry, classic',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-jagjit-singh-punjabi-ghazals',
        name: 'Jagjit Singh Punjabi Ghazals',
        url_resolved: 'https://stream.zeno.fm/syu0rdutvxhvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/jagjit-singh.jpg',
        country: 'India',
        tags: 'ghazal, punjabi, jagjit singh, poetry, classical',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-gazal-radio-london',
        name: 'Gazal Radio London',
        url_resolved: 'https://streaming.webhostnepal.com/8018/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/10/gazal-radio-london-uk.png',
        country: 'India',
        tags: 'ghazal, gazal, hindi, poetry, classic',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-panjabi-ghazal',
        name: 'Radio Panjabi Ghazal & Folk',
        url_resolved: 'https://s20.reliastream.com/stream/8134',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-panjabi.jpg',
        country: 'India',
        tags: 'ghazal, punjabi, radio panjabi, folk, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-harman-radio-punjabi',
        name: 'Harman Radio Punjabi',
        url_resolved: 'http://harmanradio.net:8000/channel1_HQ.mp3',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/harman-radio.jpg',
        country: 'Australia',
        tags: 'ghazal, punjabi, harman, folk, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-sher-e-punjab-radio',
        name: 'Sher E Punjab AM 600',
        url_resolved: 'https://ais-sa1.streamon.fm/7676_48k.aac',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/sher-e-punjab.jpg',
        country: 'Canada',
        tags: 'ghazal, punjabi, sher e punjab, talk, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-chann-pardesi',
        name: 'Radio Chann Pardesi',
        url_resolved: 'http://mehramedia.com:8021/;',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/chann-pardesi.jpg',
        country: 'India',
        tags: 'ghazal, punjabi, chann, pardesi, folk, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-akash-radio-punjabi',
        name: 'Akash Radio Punjabi',
        url_resolved: 'http://c2.radioboss.fm:8276/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/akash-radio.jpg',
        country: 'UK',
        tags: 'ghazal, punjabi, akash, asian, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-akash-radio-london-punjabi',
        name: 'Akash Radio London Punjabi',
        url_resolved: 'http://radio.canstream.co.uk:8161/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/akash-london.jpg',
        country: 'UK',
        tags: 'ghazal, punjabi, akash london, asian',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-panj-punjabi',
        name: 'Radio Panj 1521AM',
        url_resolved: 'http://s3.voscast.com:11264/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-panj.jpg',
        country: 'UK',
        tags: 'ghazal, punjabi, radio panj, asian, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-myradio-580am-punjabi',
        name: 'MyRadio 580 AM Punjabi',
        url_resolved: 'http://ais-sa1.streamon.fm/7681_64k.mp3',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/myradio-580.jpg',
        country: 'Canada',
        tags: 'ghazal, punjabi, 580am, classic, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-pankaj-udhas-ghazals',
        name: 'Pankaj Udhas Ghazal Special',
        url_resolved: 'https://stream.zeno.fm/epylmeu4zf7vv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/pankaj-udhas.jpg',
        country: 'India',
        tags: 'ghazal, pankaj udhas, hindi, romantic, retro',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-ghulam-ali-ghazals',
        name: 'Ghulam Ali Ghazal Station',
        url_resolved: 'https://stream.zeno.fm/g95zm67prfhvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/ghulam-ali.jpg',
        country: 'India',
        tags: 'ghazal, ghulam ali, hindi, classical, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-mehdi-hassan-ghazals',
        name: 'Mehdi Hassan Ghazal Classics',
        url_resolved: 'https://stream.zeno.fm/87xam8pf7tzuv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/mehdi-hassan.jpg',
        country: 'India',
        tags: 'ghazal, mehdi hassan, hindi, classical, oldies',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-classic-hindi-ghazals',
        name: 'Classic Hindi Ghazals FM',
        url_resolved: 'https://stream.zeno.fm/f2wvbbscrs8uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/classic-ghazal.jpg',
        country: 'India',
        tags: 'ghazal, hindi, poetry, retro, melodies',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-sufi-ghazal-radio',
        name: 'Sufi & Ghazal Radio',
        url_resolved: 'https://stream.zeno.fm/w062e7pf7tzuv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/sufi-ghazal.jpg',
        country: 'India',
        tags: 'ghazal, sufi, hindi, spiritual, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-chitra-singh-ghazals',
        name: 'Chitra Singh Ghazal Hits',
        url_resolved: 'https://stream.zeno.fm/65q831c260hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/chitra-singh.jpg',
        country: 'India',
        tags: 'ghazal, chitra singh, hindi, duet, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-easy-96-radio',
        name: 'Easy 96 Radio',
        url_resolved: 'https://ice8.securenetsystems.net/EASY96',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/easy-96-radio.jpg',
        country: 'India',
        tags: 'ghazal, hindi, easy 96, classics, poetry',
        lastcheckok: 1
    }
];

const CUSTOM_PUNJABI_STATIONS = [
    {
        stationuuid: 'custom-easy-punjabi-radio',
        name: 'Easy Punjabi Radio',
        url_resolved: 'https://ice24.securenetsystems.net/CKYE',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/easy-96-radio.jpg',
        country: 'India',
        tags: 'punjabi, easy punjabi, pop, folk, ghazal',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-punjabi-ghazal-sufi',
        name: 'Punjabi Ghazal & Sufi FM',
        url_resolved: 'https://stream.zeno.fm/0ghtfp8ztm0uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/sufi-ghazal.jpg',
        country: 'India',
        tags: 'punjabi, ghazal, sufi, poetry, classic',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-panjabi-ghazal',
        name: 'Radio Panjabi Ghazal & Folk',
        url_resolved: 'https://s20.reliastream.com/stream/8134',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-panjabi.jpg',
        country: 'India',
        tags: 'punjabi, ghazal, radio panjabi, folk, poetry',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-harman-radio-punjabi',
        name: 'Harman Radio Punjabi',
        url_resolved: 'http://harmanradio.net:8000/channel1_HQ.mp3',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/harman-radio.jpg',
        country: 'Australia',
        tags: 'punjabi, harman, folk, sikh, music',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-sher-e-punjab-radio',
        name: 'Sher E Punjab AM 600',
        url_resolved: 'https://ais-sa1.streamon.fm/7676_48k.aac',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/sher-e-punjab.jpg',
        country: 'Canada',
        tags: 'punjabi, sher e punjab, news, talk',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-chann-pardesi',
        name: 'Radio Chann Pardesi',
        url_resolved: 'http://mehramedia.com:8021/;',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/chann-pardesi.jpg',
        country: 'India',
        tags: 'punjabi, chann, pardesi, folk, desi',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-akash-radio-punjabi',
        name: 'Akash Radio Punjabi',
        url_resolved: 'http://c2.radioboss.fm:8276/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/akash-radio.jpg',
        country: 'UK',
        tags: 'punjabi, akash, asian, hits',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-akash-radio-london-punjabi',
        name: 'Akash Radio London Punjabi',
        url_resolved: 'http://radio.canstream.co.uk:8161/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/akash-london.jpg',
        country: 'UK',
        tags: 'punjabi, akash london, asian',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-panj-punjabi',
        name: 'Radio Panj 1521AM',
        url_resolved: 'http://s3.voscast.com:11264/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-panj.jpg',
        country: 'UK',
        tags: 'punjabi, radio panj, asian, music',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-myradio-580am-punjabi',
        name: 'MyRadio 580 AM Punjabi',
        url_resolved: 'http://ais-sa1.streamon.fm/7681_64k.mp3',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/myradio-580.jpg',
        country: 'Canada',
        tags: 'punjabi, 580am, hindi, music',
        lastcheckok: 1
    }
];

const CUSTOM_BHAKTI_STATIONS = [
    {
        stationuuid: 'custom-easy-96-radio',
        name: 'Easy 96 Radio',
        url_resolved: 'https://ice8.securenetsystems.net/EASY96',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/easy-96-radio.jpg',
        country: 'India',
        tags: 'bhakti, devotional, hindi, easy 96',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bhajans-radio-guyana',
        name: 'Bhajans Radio Guyana',
        url_resolved: 'https://s5.citrus3.com:8148/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/07/bhajan-radio-guyana.jpg',
        country: 'India',
        tags: 'bhakti, bhajans, guyana, devotional',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-krishna',
        name: 'Radio Krishna',
        url_resolved: 'https://millenniumhits.out.airtime.pro:8000/millenniumhits_a',
        favicon: 'https://radio.garden/public/icons/ios/ios-appicon-152-152.png',
        country: 'India',
        tags: 'bhakti, krishna, devotional, hindu',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bhakti-sagar-durga-maa',
        name: 'bhakti Sagar durga maa',
        url_resolved: 'https://stream.zeno.fm/syu0rdutvxhvv',
        favicon: 'https://firebasestorage.googleapis.com/v0/b/radiogalaxy-580f4.appspot.com/o/images%2FIMG_20241003_181756353.jpg?alt=media&token=175d1625-9225-4539-99d0-56481348eb18',
        country: 'India',
        tags: 'bhakti, durga, maa, devotional, hindi',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bhaktisudha',
        name: 'Bhaktisudha',
        url_resolved: 'https://n0a.radiojar.com/cfqyfcspcv8uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/bhakthisudha-hindi.jpg',
        country: 'India',
        tags: 'bhakti, bhaktisudha, devotional, hindi',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-2b-radio-sangam-shiva',
        name: '2B! Radio Sangam Shiva',
        url_resolved: 'http://hot.out.airtime.pro:8000/hot_a',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/bhakthisudha-hindi.jpg',
        country: 'India',
        tags: 'bhakti, shiva, sangam, spiritual',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bhakti-world-hanuman',
        name: 'Bhakti World - Hanuman',
        url_resolved: 'http://2bhanuman.out.airtime.pro:8000/2bhanuman_a',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/bhakthisudha-hindi.jpg',
        country: 'India',
        tags: 'bhakti, hanuman, devotional, hindi',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bhakti-world-media-shiva',
        name: 'Bhakti World Media - Shiva',
        url_resolved: 'http://hot.out.airtime.pro:8000/hot_a',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/bhakthisudha-hindi.jpg',
        country: 'India',
        tags: 'bhakti, shiva, mantra, hindi',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bhakti-world-krishna',
        name: 'Bhakti World - Krishna',
        url_resolved: 'http://millenniumhits.out.airtime.pro:8000/millenniumhits_a',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/bhakthisudha-hindi.jpg',
        country: 'India',
        tags: 'bhakti, krishna, sangeet, hindi',
        lastcheckok: 1
    }
];

const CUSTOM_HINDI_STATIONS = [
    {
        stationuuid: 'custom-easy-96-radio',
        name: 'Easy 96 Radio',
        url_resolved: 'https://ice8.securenetsystems.net/EASY96',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/easy-96-radio.jpg',
        country: 'India',
        tags: 'hindi, easy 96, pop, bollywood, bhakti',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-mirchi-hindi',
        name: 'Radio Mirchi Hindi',
        url_resolved: 'https://stream.zeno.fm/f3wvbbscrs8uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-mirchi-hindi.jpg',
        country: 'India',
        tags: 'hindi, bollywood, mirchi, top 40',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-mirchi-love',
        name: 'Mirchi Love Hindi',
        url_resolved: 'https://stream.zeno.fm/3r01bca0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/mirchi-love-hindi.jpg',
        country: 'India',
        tags: 'hindi, romantic, love, bollywood',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-red-fm-hindi',
        name: 'Red FM 93.5',
        url_resolved: 'https://stream.zeno.fm/0885zpy3x0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/red-fm.jpg',
        country: 'India',
        tags: 'hindi, superhits, red fm, bajate raho',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-city-hindi',
        name: 'Radio City Hindi',
        url_resolved: 'https://stream.zeno.fm/54ecvca0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-city-hindi.jpg',
        country: 'India',
        tags: 'hindi, city, bollywood, hits',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-big-fm-hindi',
        name: '92.7 BIG FM',
        url_resolved: 'https://stream.zeno.fm/k2k4vbbscrs8uv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/big-fm.jpg',
        country: 'India',
        tags: 'hindi, big fm, retro, classic',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-vividh-bharati',
        name: 'Vividh Bharati AIR',
        url_resolved: 'https://air.dattaradio.com/vividhbharati/stream',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/All_India_Radio_logo.svg/512px-All_India_Radio_logo.svg.png',
        country: 'India',
        tags: 'hindi, air, doordarshan, news, oldies',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-air-gold-fm',
        name: 'AIR FM Gold Hindi',
        url_resolved: 'https://air.dattaradio.com/airgold/stream',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/All_India_Radio_logo.svg/512px-All_India_Radio_logo.svg.png',
        country: 'India',
        tags: 'hindi, air gold, classics, bollywood',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-one-hindi',
        name: '94.3 Radio One Hindi',
        url_resolved: 'https://stream.zeno.fm/w0k0cda0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-one-hindi.jpg',
        country: 'India',
        tags: 'hindi, radio one, retro, international',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-fever-104-fm',
        name: 'Fever 104 FM',
        url_resolved: 'https://stream.zeno.fm/g3w1cca0b0hvv',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/fever-104-fm.jpg',
        country: 'India',
        tags: 'hindi, fever 104, bollywood, pop',
        lastcheckok: 1
    }
];

const CUSTOM_NEWS_STATIONS = [
    {
        stationuuid: 'dd-national',
        name: 'DD National HD',
        url_resolved: 'https://mumt01.tangotv.in/O5aw8Zn3DDNATIONALHD/index.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/DD_National.svg/512px-DD_National.svg.png',
        country: 'India',
        tags: 'tv, doordarshan, hindi',
        lastcheckok: 1
    },
    {
        stationuuid: 'dd-news',
        name: 'DD News',
        url_resolved: 'https://cdn-2.pishow.tv/live/12/master.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/DD_News_Logo.svg/512px-DD_News_Logo.svg.png',
        country: 'India',
        tags: 'tv, doordarshan, hindi, news',
        lastcheckok: 1
    },
    {
        stationuuid: 'dd-news-hd',
        name: 'DD News HD',
        url_resolved: 'https://cdn-2.pishow.tv/live/12/master.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/DD_News_Logo.svg/512px-DD_News_Logo.svg.png',
        country: 'India',
        tags: 'tv, doordarshan, hindi, news, hd',
        lastcheckok: 1
    },
    {
        stationuuid: 'dd-india',
        name: 'DD India',
        url_resolved: 'https://d2gvyg6lvauoko.cloudfront.net/230226/ddindia/chunks.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/DD_India_logo.svg/512px-DD_India_logo.svg.png',
        country: 'India',
        tags: 'tv, doordarshan, hindi',
        lastcheckok: 1
    }
];

const CUSTOM_BANGLA_STATIONS = [
    {
        stationuuid: 'custom-air-kolkata-geetanjali',
        name: 'AIR Kolkata Geetanjali',
        url_resolved: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio055/hlspbaudio05564kbps.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/All_India_Radio_logo.svg/512px-All_India_Radio_logo.svg.png',
        country: 'India',
        tags: 'bangla, kolkata, geetanjali, air, all india radio, news, music',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-air-fm-gold-kolkata',
        name: 'AIR FM Gold Kolkata',
        url_resolved: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio057/hlspbaudio05764kbps.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/All_India_Radio_logo.svg/512px-All_India_Radio_logo.svg.png',
        country: 'India',
        tags: 'bangla, air fm gold, kolkata, classics, oldies, news',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-akashvani-fm-rainbow-kolkata',
        name: 'Akashvani FM Rainbow Kolkata',
        url_resolved: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio058/hlspbaudio05864kbps.m3u8',
        favicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/All_India_Radio_logo.svg/512px-All_India_Radio_logo.svg.png',
        country: 'India',
        tags: 'bangla, fm rainbow, kolkata, music, pop, entertainment',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-radio-bangla-net',
        name: 'Radio Bangla Net',
        url_resolved: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R3563475_SC',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/radio-bangla-net.jpg',
        country: 'India',
        tags: 'bangla, radio bangla net, music, kolkata, hits',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-mellow-bangla',
        name: 'Mellow Bangla',
        url_resolved: 'https://radio.mellowbangla.com/stream',
        favicon: 'https://onlineradiohub.com/wp-content/uploads/2023/06/mellow-bangla.jpg',
        country: 'Bangladesh',
        tags: 'bangla, mellow, romantic, folk, bengali',
        lastcheckok: 1
    }
];

const CUSTOM_DJ_REMIX_STATIONS = [
    {
        stationuuid: 'custom-radio-deewana',
        name: 'Radio Deewana',
        url_resolved: 'https://stream.zeno.fm/x1q3r3qdxy8uv',
        favicon: 'logo.png',
        country: 'India',
        tags: 'dj remix, remix, bollywood, deewana, party',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bollywood-beyond',
        name: 'Bollywood Beyond',
        url_resolved: 'https://s6.yesstreaming.net/proxy/john1237?mp=/live',
        favicon: 'logo.png',
        country: 'India',
        tags: 'dj remix, remix, bollywood beyond, dance, party',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-goldy-blast',
        name: 'Goldy Blast',
        url_resolved: 'https://stream.zeno.fm/d0rwvvwa6p8uv',
        favicon: 'logo.png',
        country: 'India',
        tags: 'dj remix, remix, goldy blast, hits, energy',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-anbu-fm-hindi',
        name: 'Anbu FM Hindi',
        url_resolved: 'https://stream.zeno.fm/u7yaqq493v8uv',
        favicon: 'logo.png',
        country: 'India',
        tags: 'dj remix, remix, anbu fm, hindi, top 40',
        lastcheckok: 1
    },
    {
        stationuuid: 'custom-bolly923fm',
        name: 'Bolly 92.3 FM',
        url_resolved: 'https://stream.zeno.fm/k4hwu4qa4qzuv',
        favicon: 'logo.png',
        country: 'India',
        tags: 'dj remix, remix, bolly923fm, bollywood, hits',
        lastcheckok: 1
    }
];

// Application State
let currentStations = [];
let currentPlaylist = (JSON.parse(localStorage.getItem('fm_playlist')) || []).filter(s => {
    const name = (s.name || '').toLowerCase();
    const tags = (s.tags || '').toLowerCase();
    return !name.includes('jesus') && !tags.includes('jesus');
});
let currentStationIndex = -1;
let currentSource = 'search';
let currentMode = 'India';
let isMuted = false;
let lastVolume = 30;
let isHDEQEnabled = false;
let isDJBoostEnabled = false;
let is3DSurroundEnabled = false;
let isVolBoostEnabled = false;
let isSmartScanning = false;
let smartScanTimeout = null;
let playCheckTimeout = null;
let queueTickerInterval = null;
let showingNextInQueue = true;
let lastQuery = '';
let lastCountry = '';
let lastTag = '';
let wakeLock = null;
let consecutiveErrors = 0;
let visualizerMode = 'dancefloor'; // 'dancefloor', 'bars', 'wave', 'circle'
let sleepTimerId = null;
let sleepTimerEndTime = null;
let currentVolumeLevel = 30;

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const keepAliveAudio = document.getElementById('keep-alive-audio');
const stationsGrid = document.getElementById('stations-grid');
const searchInput = document.getElementById('station-search');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const modeToggleBtn = document.getElementById('mode-toggle-btn');
const modeToggleText = document.getElementById('mode-toggle-text');
const modeToggleIcon = document.getElementById('mode-toggle-icon');
const categoriesBar = document.getElementById('categories-bar');
const indiaCats = document.getElementById('india-cats');
const globalCats = document.getElementById('global-cats');
const catButtons = document.querySelectorAll('.cat-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeBadge = document.getElementById('volume-value-badge');
const playerStatus = document.getElementById('player-status');
const currentStationName = document.getElementById('current-station-name');
const currentStationMeta = document.getElementById('current-station-meta');
const currentStationImg = document.getElementById('current-station-info-img');
const miniStationImg = document.getElementById('player-mini-img');
const miniStationTitle = document.getElementById('mini-station-title');
const miniStationSubtitle = document.getElementById('mini-station-subtitle');
const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
const favHeartIcon = document.getElementById('fav-heart-icon');
const resultsCount = document.getElementById('results-count');
const mainLoader = document.getElementById('main-loader');
const nowPlayingCard = document.querySelector('.now-playing-card');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const tabRefreshBtn = document.getElementById('tab-refresh-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const eqHdBtn = document.getElementById('eq-hd-btn');
const djBoostBtn = document.getElementById('dj-boost-btn');
const surround3dBtn = document.getElementById('3d-surround-btn');
const volBoostCheck = document.getElementById('vol-boost-check-input');
const smartAutoScanBtn = document.getElementById('smart-auto-scan-btn');
const queueTickerText = document.getElementById('queue-ticker-text');
const digitalFreqReadout = document.getElementById('digital-freq-readout');

const mainTabs = document.querySelectorAll('.tab-btn:not(.action-btn)');
const views = {
    discovery: document.getElementById('discovery-view'),
    playlist: document.getElementById('playlist-view')
};
const quickPlaylistList = document.getElementById('quick-playlist-list');
const fullPlaylistList = document.getElementById('full-playlist-list');
const playlistCountBadge = document.getElementById('playlist-count-badge');
const quickFavCount = document.getElementById('quick-fav-count');

const sleepTimerBtn = document.getElementById('sleep-timer-btn');
const sleepTimerMenu = document.getElementById('sleep-timer-menu');
const timerBadge = document.getElementById('timer-badge');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');

// Hero Volume Drag Overlay DOM Elements & State
const heroVolOverlay = document.getElementById('hero-volume-overlay');
const heroVolText = document.getElementById('hero-volume-text');

let isDraggingHeroVol = false;
let volDragStartX = 0;
let volDragStartValue = 30;
let volHudTimeout = null;

function showHeroVolumeHUD(value) {
    if (!heroVolOverlay || !heroVolText) return;
    heroVolText.textContent = `${value}%`;
    heroVolOverlay.classList.add('visible');
    
    clearTimeout(volHudTimeout);
    volHudTimeout = setTimeout(() => {
        if (!isDraggingHeroVol) {
            heroVolOverlay.classList.remove('visible');
        }
    }, 1200);
}

function setupHeroVolumeDrag() {
    const heroSec = document.getElementById('hero-section') || document.querySelector('.hero-section');
    if (!heroSec) return;

    let volDragStartY = 0;
    let scrollStartTop = 0;
    let dragDirectionLocked = null; // 'horizontal' | 'vertical' | null

    // Mouse Drag
    heroSec.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, input, a, label, .viz-btn, .fav-heart-btn')) {
            return;
        }
        isDraggingHeroVol = true;
        dragDirectionLocked = null;
        volDragStartX = e.clientX;
        volDragStartY = e.clientY;
        scrollStartTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        volDragStartValue = currentVolumeLevel;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingHeroVol) return;
        
        const deltaX = e.clientX - volDragStartX;
        const deltaY = e.clientY - volDragStartY;

        if (!dragDirectionLocked) {
            if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
                if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                    dragDirectionLocked = 'horizontal';
                    if (heroSec) heroSec.classList.add('is-dragging-vol');
                    updateVolume(volDragStartValue, true);
                } else {
                    dragDirectionLocked = 'vertical';
                }
            }
        }

        if (dragDirectionLocked === 'horizontal') {
            e.preventDefault();
            const volChange = Math.round(deltaX * 0.35);
            let newVol = Math.min(100, Math.max(0, volDragStartValue + volChange));
            updateVolume(newVol, true);
        } else if (dragDirectionLocked === 'vertical') {
            window.scrollTo(0, scrollStartTop - deltaY);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDraggingHeroVol) {
            isDraggingHeroVol = false;
            dragDirectionLocked = null;
            if (heroSec) heroSec.classList.remove('is-dragging-vol');
            volHudTimeout = setTimeout(() => {
                if (heroVolOverlay) heroVolOverlay.classList.remove('visible');
            }, 1000);
        }
    });

    // Touch Drag
    heroSec.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, input, a, label, .viz-btn, .fav-heart-btn')) {
            return;
        }
        if (e.touches.length === 1) {
            isDraggingHeroVol = true;
            dragDirectionLocked = null;
            volDragStartX = e.touches[0].clientX;
            volDragStartY = e.touches[0].clientY;
            volDragStartValue = currentVolumeLevel;
        }
    }, { passive: true });

    heroSec.addEventListener('touchmove', (e) => {
        if (!isDraggingHeroVol || e.touches.length !== 1) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - volDragStartX;
        const deltaY = currentY - volDragStartY;

        if (!dragDirectionLocked) {
            if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
                if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                    dragDirectionLocked = 'horizontal';
                    if (heroSec) heroSec.classList.add('is-dragging-vol');
                    updateVolume(volDragStartValue, true);
                } else {
                    dragDirectionLocked = 'vertical';
                }
            }
        }

        if (dragDirectionLocked === 'horizontal') {
            if (e.cancelable) e.preventDefault();
            const volChange = Math.round(deltaX * 0.35);
            let newVol = Math.min(100, Math.max(0, volDragStartValue + volChange));
            updateVolume(newVol, true);
        }
    }, { passive: false });

    const endTouch = () => {
        if (isDraggingHeroVol) {
            isDraggingHeroVol = false;
            dragDirectionLocked = null;
            if (heroSec) heroSec.classList.remove('is-dragging-vol');
            volHudTimeout = setTimeout(() => {
                if (heroVolOverlay) heroVolOverlay.classList.remove('visible');
            }, 1000);
        }
    };

    heroSec.addEventListener('touchend', endTouch);
    heroSec.addEventListener('touchcancel', endTouch);
}

// Initialize Application
function init() {
    setupEventListeners();
    setupStationAudioAura();
    setupHeroVolumeDrag();
    fetchStations('', 'India');
    renderPlaylist();
    updateVolume(30);
    loadTheme();
    setupStatusObserver();
}

function setupStatusObserver() {
    const statusObserver = new MutationObserver(() => {
        const text = playerStatus.textContent.toLowerCase();
        
        if (text.includes('buffer') || text.includes('load') || text.includes('scan') || text.includes('tune')) {
            playerStatus.style.color = 'var(--gold-accent)';
            playerStatus.style.background = 'rgba(245, 158, 11, 0.15)';
            playerStatus.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            playerStatus.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.3)';
        } else if (text.includes('play')) {
            playerStatus.style.color = 'var(--emerald-accent)';
            playerStatus.style.background = 'rgba(16, 185, 129, 0.15)';
            playerStatus.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            playerStatus.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.3)';
        } else if (text.includes('pause') || text.includes('stop') || text.includes('error') || text.includes('fail') || text.includes('stall')) {
            playerStatus.style.color = 'var(--accent-color)';
            playerStatus.style.background = 'rgba(236, 72, 153, 0.15)';
            playerStatus.style.borderColor = 'rgba(236, 72, 153, 0.3)';
            playerStatus.style.boxShadow = '0 0 12px rgba(236, 72, 153, 0.3)';
        } else {
            playerStatus.style.color = 'var(--cyan-accent)';
            playerStatus.style.background = 'rgba(6, 182, 212, 0.15)';
            playerStatus.style.borderColor = 'rgba(6, 182, 212, 0.3)';
            playerStatus.style.boxShadow = '0 0 12px rgba(6, 182, 212, 0.3)';
        }
    });
    statusObserver.observe(playerStatus, { childList: true, characterData: true, subtree: true });
}

function showToast(message, icon = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function setupEventListeners() {
    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('input', () => {
        clearSearchBtn.style.display = searchInput.value.trim() ? 'flex' : 'none';
    });
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        fetchStations('', currentMode === 'India' ? 'India' : '');
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    function performSearch() {
        const query = searchInput.value.trim();
        const country = currentMode === 'India' ? 'India' : '';
        fetchStations(query, country);
        switchView('discovery');
    }

    // Mode Toggle (India / Global)
    modeToggleBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        if (currentMode === 'India') {
            currentMode = 'Global';
            modeToggleText.textContent = 'Global';
            if (modeToggleIcon) modeToggleIcon.textContent = '🌍';
            modeToggleBtn.classList.remove('india-active');
            indiaCats.style.display = 'none';
            globalCats.style.display = 'flex';
            fetchStations('', '');
            showToast('Switched to Global Mode', 'globe');
        } else {
            currentMode = 'India';
            modeToggleText.textContent = 'India';
            if (modeToggleIcon) modeToggleIcon.textContent = '🇮🇳';
            modeToggleBtn.classList.add('india-active');
            globalCats.style.display = 'none';
            indiaCats.style.display = 'flex';
            fetchStations('', 'India');
            showToast('Switched to India Mode', 'flag');
        }
        updateActiveCat('All');
        switchView('discovery');
    });

    // Categories
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.dataset.tag;
            const country = currentMode === 'India' ? 'India' : '';
            fetchStations('', country, tag, true);
            updateActiveCat(btn.textContent);
            switchView('discovery');
        });
    });

    // Drag category scroll
    let isDown = false;
    let startX, scrollLeft;
    categoriesBar.addEventListener('mousedown', (e) => {
        isDown = true;
        categoriesBar.style.cursor = 'grabbing';
        startX = e.pageX - categoriesBar.offsetLeft;
        scrollLeft = categoriesBar.scrollLeft;
    });
    categoriesBar.addEventListener('mouseleave', () => { isDown = false; categoriesBar.style.cursor = 'grab'; });
    categoriesBar.addEventListener('mouseup', () => { isDown = false; categoriesBar.style.cursor = 'grab'; });
    categoriesBar.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - categoriesBar.offsetLeft;
        const walk = (x - startX) * 2;
        categoriesBar.scrollLeft = scrollLeft - walk;
    });

    // Refresh button
    if (tabRefreshBtn) {
        tabRefreshBtn.addEventListener('click', () => fetchStations(lastQuery, lastCountry, lastTag));
    }

    // Fullscreen
    const handleFSChange = () => {
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (isFS) {
            document.body.classList.add('is-fullscreen');
        } else {
            document.body.classList.remove('is-fullscreen');
        }
    };

    // Fullscreen Toggle Helper
    const toggleFullscreen = () => {
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFS) {
            const el = document.documentElement;
            const reqFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
            if (reqFS) reqFS.call(el).catch(err => console.log(err));
        } else {
            const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
            if (exitFS) exitFS.call(document);
        }
    };

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Double click window to enter / exit fullscreen
    document.addEventListener('dblclick', (e) => {
        if (e.target.closest('button, input, a, label, textarea, select, .viz-btn, .fav-heart-btn, .cat-btn')) {
            return;
        }
        toggleFullscreen();
    });

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, handleFSChange);
    });

    // View Switcher (Grid / List)
    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            stationsGrid.classList.add('grid-layout');
        });
        listViewBtn.addEventListener('click', () => {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            stationsGrid.classList.remove('grid-layout');
        });
    }

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Playback Controls
    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);

    // Volume Slider
    if (volumeSlider) volumeSlider.addEventListener('input', (e) => updateVolume(e.target.value, true));

    // Playlist Add / Heart Button
    addToPlaylistBtn.addEventListener('click', () => {
        if (currentStationIndex >= 0 && currentStations[currentStationIndex]) {
            togglePlaylistStation(currentStations[currentStationIndex]);
        }
    });

    // FX Toggles
    if (eqHdBtn) eqHdBtn.addEventListener('click', toggleHDEQ);
    if (djBoostBtn) djBoostBtn.addEventListener('click', toggleDJBoost);
    if (surround3dBtn) surround3dBtn.addEventListener('click', toggle3DSurround);
    if (volBoostCheck) volBoostCheck.addEventListener('change', toggleVolBoost);
    if (smartAutoScanBtn) smartAutoScanBtn.addEventListener('click', toggleSmartAutoScan);

    // Sleep Timer
    if (sleepTimerBtn && sleepTimerMenu) {
        sleepTimerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sleepTimerMenu.style.display = sleepTimerMenu.style.display === 'none' ? 'flex' : 'none';
        });
        document.addEventListener('click', () => { sleepTimerMenu.style.display = 'none'; });

        const timerOpts = sleepTimerMenu.querySelectorAll('.timer-opt');
        timerOpts.forEach(opt => {
            opt.addEventListener('click', () => {
                timerOpts.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                const mins = parseInt(opt.dataset.minutes);
                setSleepTimer(mins);
            });
        });
    }

    // Visualizer Mode Switches
    document.querySelectorAll('.viz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.viz-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            visualizerMode = btn.dataset.mode;
        });
    });

    // Main Tabs
    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.tab));
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch(e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowUp': e.preventDefault(); updateVolume(Math.min(100, currentVolumeLevel + 5), true); break;
            case 'ArrowDown': e.preventDefault(); updateVolume(Math.max(0, currentVolumeLevel - 5), true); break;
            case 'ArrowLeft': e.preventDefault(); playPrevious(); break;
            case 'ArrowRight': e.preventDefault(); playNext(); break;
        }
    });

    // Audio Event Handlers
    audioPlayer.onplay = () => {
        playPauseBtn.innerHTML = '<i data-lucide="pause" id="play-icon"></i>';
        lucide.createIcons();
        playerStatus.textContent = 'Playing';
        if (nowPlayingCard) nowPlayingCard.classList.add('playing');
        requestWakeLock();
        if (keepAliveAudio) keepAliveAudio.play().catch(e => console.log(e));
    };

    audioPlayer.onplaying = () => {
        consecutiveErrors = 0;
        clearTimeout(playCheckTimeout);
        if (nowPlayingCard) nowPlayingCard.classList.add('playing');
        playerStatus.textContent = 'Playing';
    };

    audioPlayer.onpause = () => {
        playPauseBtn.innerHTML = '<i data-lucide="play" id="play-icon"></i>';
        lucide.createIcons();
        playerStatus.textContent = 'Paused';
        if (nowPlayingCard) nowPlayingCard.classList.remove('playing');
        releaseWakeLock();
        if (keepAliveAudio) keepAliveAudio.pause();
    };

    audioPlayer.onerror = () => {
        consecutiveErrors++;
        if (consecutiveErrors < 8) {
            playerStatus.textContent = 'Stream Error - Auto reconnecting...';
            setTimeout(() => playNext(), 1500);
        } else {
            playerStatus.textContent = 'Playback Error';
            if (nowPlayingCard) nowPlayingCard.classList.remove('playing');
            consecutiveErrors = 0;
        }
    };
}

// Fetch Stations
const fetchMappings = {
    'australia news': [ { tag: 'news', country: 'Australia' } ],
    'euro news': [ { name: 'euronews' }, { tag: 'news', language: 'english' } ],
    'bbc news': [ { name: 'bbc news' }, { name: 'bbc radio', tag: 'news' } ],
    'us news': [ { tag: 'news', country: 'United States' } ],
    'world news': [ { tag: 'world news' }, { tag: 'international news' } ],
    'russian news': [ { tag: 'news', country: 'Russia' } ],
    'france news': [ { tag: 'news', country: 'France' } ],
    'pop': [ { tag: 'pop' } ],
    'rock': [ { tag: 'rock' } ],
    'jazz': [ { tag: 'jazz' } ],
    'classical': [ { tag: 'classical' } ],
    'hip hop': [ { tag: 'hip hop' } ],
    'electronic': [ { tag: 'electronic' } ],
    'ambient': [ { tag: 'ambient' } ],
    'dance music': [ { tag: 'dance' } ],
    'educational': [ { tag: 'educational' } ],
    'sports': [ { tag: 'sports' } ],
    'talk': [ { tag: 'talk' } ],
    'hindi': [ { tag: 'hindi', country: 'India' } ],
    'regional': [ { tag: 'tamil', country: 'India' }, { tag: 'telugu', country: 'India' }, { tag: 'punjabi', country: 'India' } ],
    'bollywood': [ { tag: 'bollywood', country: 'India' } ],
    'dj remix': [ { tag: 'dj remix', country: 'India' }, { tag: 'remix', country: 'India' } ],
    'singer': [ { name: 'kishore' }, { name: 'lata' }, { name: 'arijit' } ],
    'ghazal': [ { name: 'gazal' } ],
    'punjabi': [ { tag: 'punjabi' } ],
    'panjabi': [ { tag: 'punjabi' } ],
    'bangla': [ { tag: 'bangla' }, { tag: 'bengali' } ],
    'bengali': [ { tag: 'bangla' }, { tag: 'bengali' } ],
    'news': [ { tag: 'news', country: 'India' } ]
};

async function fetchStations(query = '', country = '', tag = '', autoPlay = false) {
    lastQuery = query;
    lastCountry = country;
    lastTag = tag;
    
    mainLoader.style.display = 'flex';
    stationsGrid.innerHTML = '';
    
    let url = `${API_BASE}/stations/search?limit=${DEFAULT_LIMIT}&order=clickcount&reverse=true&hidebroken=true`;
    if (country) url += `&country=${encodeURIComponent(country)}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (query) url += `&name=${encodeURIComponent(query)}`;

    try {
        const lowerTag = tag.toLowerCase();
        const lowerQuery = query.toLowerCase();

        if (lowerTag === 'ghazal' || lowerTag === 'gazal' || lowerQuery.includes('ghazal') || lowerQuery.includes('gazal')) {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_GHAZAL_STATIONS, ...resp];
        } else if (lowerTag === 'punjabi' || lowerTag === 'panjabi' || lowerQuery.includes('punjabi') || lowerQuery.includes('panjabi')) {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_PUNJABI_STATIONS, ...resp];
        } else if (lowerTag === 'bangla' || lowerTag === 'bengali' || lowerQuery.includes('bangla') || lowerQuery.includes('bengali')) {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_BANGLA_STATIONS, ...resp];
        } else if (lowerTag === 'dj remix' || lowerTag === 'remix' || lowerQuery.includes('remix') || lowerQuery.includes('dj')) {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_DJ_REMIX_STATIONS, ...resp];
        } else if (lowerTag === 'singer' || lowerQuery.includes('singer')) {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_SINGER_STATIONS, ...resp];
        } else if (lowerTag === 'hindi' || lowerQuery === 'hindi') {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_HINDI_STATIONS, ...resp];
        } else if (lowerTag === 'bhakti' || lowerTag === 'devotional' || lowerQuery.includes('bhakti')) {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_BHAKTI_STATIONS, ...resp];
        } else if (lowerTag === 'news') {
            const resp = await fetch(url).then(r => r.json()).catch(() => []);
            currentStations = [...CUSTOM_NEWS_STATIONS, ...resp];
        } else {
            const response = await fetch(url);
            currentStations = await response.json();
        }

        // Enforce STRICT Active Station Filtering (lastcheckok === 1), Unique Channel Verification, and Block List
        const seenNames = new Set();
        const seenUrls = new Set();
        currentStations = currentStations.filter(station => {
            if (!station) return false;
            // Only include active stations verified by server check
            if (station.lastcheckok !== 1 && station.lastcheckok !== undefined) return false;
            
            const rawName = station.name || '';
            const rawTags = station.tags || '';
            // Block Jesus Radio and any Jesus-related stations
            if (rawName.toLowerCase().includes('jesus') || rawTags.toLowerCase().includes('jesus')) {
                return false;
            }

            const streamUrl = station.url_resolved || station.url;
            if (!streamUrl || typeof streamUrl !== 'string' || !streamUrl.trim()) return false;

            const normName = station.name ? station.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            const normUrl = streamUrl.trim().toLowerCase();
            
            if (normName && seenNames.has(normName)) return false;
            if (seenUrls.has(normUrl)) return false;
            
            if (normName) seenNames.add(normName);
            seenUrls.add(normUrl);
            
            return true;
        });
        renderStations();
        resultsCount.textContent = `${currentStations.length} stations found`;

        if (currentStations.length > 0) {
            if (autoPlay) {
                playStation(0, 'search');
            } else {
                currentStationIndex = 0;
                updatePlayerUI(currentStations[0]);
                playerStatus.textContent = 'Ready';
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        stationsGrid.innerHTML = '<div class="empty-state"><p>Unable to connect to radio server. Retrying...</p></div>';
    } finally {
        mainLoader.style.display = 'none';
    }
}

// Render Stations Grid
function renderStations() {
    if (currentStations.length === 0) {
        stationsGrid.innerHTML = '<div class="empty-state"><i data-lucide="radio"></i><p>No stations found for this selection.</p></div>';
        return;
    }

    stationsGrid.innerHTML = currentStations.map((station, index) => {
        const isFav = currentPlaylist.some(s => s.stationuuid === station.stationuuid);
        return `
            <div class="station-item ${currentStationIndex === index && currentSource === 'search' ? 'active' : ''}" onclick="playStation(${index}, 'search', this)">
                <img src="${station.favicon || DEFAULT_LOGO}" class="list-img" loading="lazy" onerror="this.src='${DEFAULT_LOGO}';">
                <div class="item-info">
                    <h4>${station.name}</h4>
                    <p>${station.country || 'Global'} • ${station.tags ? station.tags.split(',')[0] : 'FM'}</p>
                </div>
                <div class="item-actions">
                    <button class="icon-btn" onclick="event.stopPropagation(); togglePlaylistById('${station.stationuuid}')" title="${isFav ? 'Remove Favorite' : 'Add Favorite'}">
                        <i data-lucide="${isFav ? 'heart' : 'plus-circle'}" style="${isFav ? 'color: var(--accent-color)' : ''}"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    updateQueueInfo();
    lucide.createIcons();
}

function renderPlaylist() {
    const isFavEmpty = currentPlaylist.length === 0;
    const playlistHTML = isFavEmpty 
        ? `<div class="empty-state"><i data-lucide="list-music"></i><p>No favorite stations saved</p></div>`
        : currentPlaylist.map((station, index) => `
            <div class="station-item" onclick="playStation(${index}, 'playlist', this)">
                <img src="${station.favicon || DEFAULT_LOGO}" class="list-img" loading="lazy" onerror="this.src='${DEFAULT_LOGO}';">
                <div class="item-info">
                    <h4>${station.name}</h4>
                    <p>${station.country || 'Custom Station'}</p>
                </div>
                <div class="item-actions">
                    <button class="icon-btn" onclick="event.stopPropagation(); removeFromPlaylist(${index})">
                        <i data-lucide="trash-2" style="color: var(--accent-color)"></i>
                    </button>
                </div>
            </div>
        `).join('');

    if (quickPlaylistList) quickPlaylistList.innerHTML = playlistHTML;
    if (fullPlaylistList) fullPlaylistList.innerHTML = playlistHTML;
    if (playlistCountBadge) playlistCountBadge.textContent = currentPlaylist.length;
    if (quickFavCount) quickFavCount.textContent = `${currentPlaylist.length} items`;
    
    updateQueueInfo();
    lucide.createIcons();
}

function switchView(target) {
    mainTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === target);
    });
    Object.keys(views).forEach(key => {
        if (views[key]) views[key].style.display = key === target ? 'block' : 'none';
    });
}

// Playback Engine
function playStation(index, source = 'search', element = null) {
    currentSource = source;
    const list = source === 'search' ? currentStations : currentPlaylist;
    const station = list[index];
    if (!station) return;

    currentStationIndex = index;
    updatePlayerUI(station);
    updateDigitalFrequency();

    audioPlayer.src = station.url_resolved || station.url;
    audioPlayer.load();
    
    audioPlayer.play().catch(e => {
        console.warn('Autoplay blocked:', e);
        playerStatus.textContent = 'Click Play to Listen';
    });

    const items = document.querySelectorAll('.station-item');
    items.forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
}

function updateDigitalFrequency() {
    if (!digitalFreqReadout) return;
    // Generate a random frequency readout for retro FM feel
    const randomFreq = (87.5 + Math.random() * 20.4).toFixed(1);
    digitalFreqReadout.textContent = randomFreq;
}

function updateQueueInfo() {
    const queuePrevItem = document.getElementById('queue-prev-item');
    const queueNextItem = document.getElementById('queue-next-item');
    const queuePrevName = document.getElementById('queue-prev-name');
    const queueNextName = document.getElementById('queue-next-name');

    const list = currentSource === 'search' ? currentStations : currentPlaylist;
    if (!list || list.length === 0) {
        if (queuePrevName) queuePrevName.textContent = '--';
        if (queueNextName) queueNextName.textContent = '--';
        return;
    }

    const idx = (currentStationIndex >= 0 && currentStationIndex < list.length) ? currentStationIndex : 0;
    const prevIndex = (idx - 1 + list.length) % list.length;
    const nextIndex = (idx + 1) % list.length;

    const prevStation = list[prevIndex];
    const nextStation = list[nextIndex];

    if (queuePrevName) queuePrevName.textContent = prevStation ? prevStation.name : '--';
    if (queueNextName) queueNextName.textContent = nextStation ? nextStation.name : '--';

    // Reset rotation state: start with NEXT showing first
    showingNextInQueue = true;
    if (queueNextItem && queuePrevItem) {
        queueNextItem.style.display = 'inline-flex';
        queuePrevItem.style.display = 'none';
    }

    // Set 3-second alternating toggle interval
    if (queueTickerInterval) clearInterval(queueTickerInterval);
    queueTickerInterval = setInterval(() => {
        showingNextInQueue = !showingNextInQueue;
        if (queueNextItem && queuePrevItem) {
            if (showingNextInQueue) {
                queueNextItem.style.display = 'inline-flex';
                queuePrevItem.style.display = 'none';
            } else {
                queueNextItem.style.display = 'none';
                queuePrevItem.style.display = 'inline-flex';
            }
        }
    }, 3000);
}

function updatePlayerUI(station) {
    const name = station.name || 'Unknown Station';
    const country = station.country || 'Global';
    const tags = station.tags ? station.tags.split(',').slice(0, 2).join(', ') : 'FM Radio';
    const img = station.favicon || DEFAULT_LOGO;

    if (currentStationName) currentStationName.textContent = name;
    if (currentStationMeta) currentStationMeta.textContent = `${country} • ${tags}`;
    if (currentStationImg) {
        currentStationImg.src = img;
        currentStationImg.onerror = () => { currentStationImg.src = DEFAULT_LOGO; };
    }
    if (miniStationImg) {
        miniStationImg.src = img;
        miniStationImg.onerror = () => { miniStationImg.src = DEFAULT_LOGO; };
    }
    if (miniStationTitle) miniStationTitle.textContent = name;
    if (miniStationSubtitle) miniStationSubtitle.textContent = country;

    const isFav = currentPlaylist.some(s => s.stationuuid === station.stationuuid);
    if (favHeartIcon) {
        favHeartIcon.setAttribute('data-lucide', isFav ? 'heart' : 'heart-off');
        if (addToPlaylistBtn) {
            addToPlaylistBtn.style.color = isFav ? 'var(--accent-color)' : '#fff';
        }
    }
    updateQueueInfo();
    lucide.createIcons();
}

function togglePlay() {
    if (audioPlayer.paused) {
        if (!audioPlayer.src && currentStations.length > 0) {
            playStation(0, 'search');
        } else {
            audioPlayer.play().catch(e => console.warn(e));
        }
    } else {
        audioPlayer.pause();
    }
}

function playNext() {
    const list = currentSource === 'search' ? currentStations : currentPlaylist;
    if (list.length === 0) return;
    currentStationIndex = (currentStationIndex + 1) % list.length;
    playStation(currentStationIndex, currentSource);
}

function playPrevious() {
    const list = currentSource === 'search' ? currentStations : currentPlaylist;
    if (list.length === 0) return;
    currentStationIndex = (currentStationIndex - 1 + list.length) % list.length;
    playStation(currentStationIndex, currentSource);
}

// Volume Controls
function updateVolume(value, showHUD = false) {
    currentVolumeLevel = Math.min(100, Math.max(0, parseInt(value) || 0));
    let vol = currentVolumeLevel / 100;
    if (volumeSlider) volumeSlider.value = currentVolumeLevel;
    if (volumeBadge) volumeBadge.textContent = `${currentVolumeLevel}%`;

    if (isVolBoostEnabled) vol = 1.0;
    else if (isHDEQEnabled) vol = Math.min(1.0, vol * 1.25);

    audioPlayer.volume = vol;
    
    let icon = 'volume-2';
    if (vol === 0) icon = 'volume-x';
    else if (vol < 0.5) icon = 'volume-1';
    
    if (muteBtn) {
        muteBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
        lucide.createIcons();
    }

    if (showHUD && typeof showHeroVolumeHUD === 'function') {
        showHeroVolumeHUD(currentVolumeLevel);
    }
}

function toggleMute() {
    if (isMuted) {
        updateVolume(lastVolume);
        isMuted = false;
    } else {
        lastVolume = currentVolumeLevel;
        updateVolume(0);
        isMuted = true;
    }
}

// Playlist Functions
function togglePlaylistStation(station) {
    const index = currentPlaylist.findIndex(s => s.stationuuid === station.stationuuid);
    if (index > -1) {
        currentPlaylist.splice(index, 1);
        showToast('Removed from Favorites', 'trash-2');
    } else {
        currentPlaylist.push(station);
        showToast('Saved to Favorites', 'heart');
    }
    localStorage.setItem('fm_playlist', JSON.stringify(currentPlaylist));
    renderPlaylist();
    updatePlayerUI(station);
}

function togglePlaylistById(uuid) {
    const station = currentStations.find(s => s.stationuuid === uuid);
    if (station) togglePlaylistStation(station);
}

function removeFromPlaylist(index) {
    currentPlaylist.splice(index, 1);
    localStorage.setItem('fm_playlist', JSON.stringify(currentPlaylist));
    renderPlaylist();
    showToast('Removed from Favorites', 'trash-2');
}

function updateActiveCat(label) {
    catButtons.forEach(btn => {
        btn.classList.toggle('active', btn.textContent === label);
    });
}

// Theme
function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('fm_theme', theme);
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', theme === 'light' ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

function loadTheme() {
    setTheme(localStorage.getItem('fm_theme') || 'dark');
}

// FX Toggles
function toggleHDEQ() {
    isHDEQEnabled = !isHDEQEnabled;
    eqHdBtn.classList.toggle('active', isHDEQEnabled);
    showToast(isHDEQEnabled ? 'HD Audio & EQ Active' : 'HD Audio Off', 'sliders');
}

function toggleDJBoost() {
    isDJBoostEnabled = !isDJBoostEnabled;
    djBoostBtn.classList.toggle('active', isDJBoostEnabled);
    showToast(isDJBoostEnabled ? 'DJ Beats Boost Active' : 'DJ Boost Off', 'zap');
}

function toggle3DSurround() {
    is3DSurroundEnabled = !is3DSurroundEnabled;
    surround3dBtn.classList.toggle('active', is3DSurroundEnabled);
    showToast(is3DSurroundEnabled ? '3D Surround Sound Active' : '3D Sound Off', 'disc');
}

function toggleVolBoost(e) {
    isVolBoostEnabled = e.target.checked;
    showToast(isVolBoostEnabled ? 'Max Volume Boost ON' : 'Volume Boost OFF', 'volume-2');
}

function toggleSmartAutoScan() {
    isSmartScanning = !isSmartScanning;
    if (isSmartScanning) {
        smartAutoScanBtn.innerHTML = '<i data-lucide="stop-circle"></i><span>Stop Scan</span>';
        smartAutoScanBtn.style.background = 'var(--accent-color)';
        smartAutoScanBtn.style.color = '#fff';
        lucide.createIcons();
        showToast('Auto Scan Started', 'zap');
        playSmartScanStation();
    } else {
        smartAutoScanBtn.innerHTML = '<i data-lucide="zap"></i><span>Auto Scan</span>';
        smartAutoScanBtn.style.background = '';
        smartAutoScanBtn.style.color = '';
        lucide.createIcons();
        clearTimeout(smartScanTimeout);
        showToast('Auto Scan Stopped', 'stop-circle');
    }
}

function playSmartScanStation() {
    if (!isSmartScanning || currentStations.length === 0) return;
    currentStationIndex = (currentStationIndex + 1) % currentStations.length;
    playStation(currentStationIndex, 'search');
    smartScanTimeout = setTimeout(() => playSmartScanStation(), 7000);
}

// Sleep Timer Logic
function setSleepTimer(minutes) {
    if (sleepTimerId) clearTimeout(sleepTimerId);
    if (minutes === 0) {
        timerBadge.style.display = 'none';
        showToast('Sleep Timer Off', 'clock');
        return;
    }
    timerBadge.style.display = 'block';
    timerBadge.textContent = `${minutes}m`;
    showToast(`Sleep Timer set to ${minutes} min`, 'clock');
    
    sleepTimerId = setTimeout(() => {
        audioPlayer.pause();
        timerBadge.style.display = 'none';
        showToast('Radio paused by Sleep Timer', 'moon');
    }, minutes * 60 * 1000);
}

// Wake Lock
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) { console.log(e); }
}

function releaseWakeLock() {
    if (wakeLock) { wakeLock.release(); wakeLock = null; }
}

// Dynamic Station Audio Background Light Aura Render Loop
function setupStationAudioAura() {
    const stationAudioAura = document.getElementById('station-audio-aura');
    if (!stationAudioAura) return;

    function animateAura() {
        requestAnimationFrame(animateAura);
        const isPlaying = !audioPlayer.paused && audioPlayer.readyState >= 3;
        if (isPlaying) {
            const time = Date.now() * 0.004;
            const pulse = 1 + Math.abs(Math.sin(time * 6) * Math.cos(time * 3)) * 0.22;
            const blur = 16 + pulse * 14;
            const opacity = 0.5 + pulse * 0.45;
            const hueShift = (time * 60) % 360;

            stationAudioAura.style.transform = `scale(${pulse})`;
            stationAudioAura.style.filter = `blur(${blur}px)`;
            stationAudioAura.style.opacity = opacity;
            stationAudioAura.style.background = `radial-gradient(circle, hsl(${hueShift}, 100%, 60%) 0%, hsl(${(hueShift + 60) % 360}, 100%, 55%) 50%, hsl(${(hueShift + 120) % 360}, 100%, 50%) 100%)`;
        } else {
            stationAudioAura.style.transform = 'scale(0.95)';
            stationAudioAura.style.filter = 'blur(12px)';
            stationAudioAura.style.opacity = '0.2';
        }
    }

    animateAura();
}

// Start
init();
