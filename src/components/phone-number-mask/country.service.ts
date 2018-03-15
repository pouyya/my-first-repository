import { Injectable } from "@angular/core";

interface Country {
  name: string,
  dialCode: string
  countryCode: string,
}


@Injectable()
export class CountryService {
  private countries: Country[];

  public getCountries(): Country[] {
    if (!this.countries || this.countries.length == 0)
      this.countries = this.loadCountries();
    return this.countries;
  }

  public loadCountries = (): Country[] => {
    let countries = [
      {"name": "Azerbaijan", "dialCode": "994", "countryCode": "az"}, {
      "name": "Bahamas",
      "dialCode": "1242",
      "countryCode": "bs"
    }, {"name": "Bahrain", "dialCode": "973", "countryCode": "bh"}, {
      "name": "Bangladesh",
      "dialCode": "880",
      "countryCode": "bd"
    }, {"name": "Barbados", "dialCode": "1246", "countryCode": "bb"}, {
      "name": "Belarus",
      "dialCode": "375",
      "countryCode": "by"
    }, {"name": "Belgium", "dialCode": "32", "countryCode": "be"}, {
      "name": "Belize",
      "dialCode": "501",
      "countryCode": "bz"
    }, {"name": "Benin", "dialCode": "229", "countryCode": "bj"}, {
      "name": "Bermuda",
      "dialCode": "1441",
      "countryCode": "bm"
    }, {"name": "Bhutan", "dialCode": "975", "countryCode": "bt"}, {
      "name": "Bolivia",
      "dialCode": "591",
      "countryCode": "bo"
    }, {"name": "Bosnia And Herzegowina", "dialCode": "387", "countryCode": "ba"}, {
      "name": "Botswana",
      "dialCode": "267",
      "countryCode": "bw"
    }, {"name": "Brazil", "dialCode": "55", "countryCode": "br"}, {
      "name": "British Indian Ocean Territory",
      "dialCode": "246",
      "countryCode": "io"
    }, {"name": "Virgin Islands (British)", "dialCode": "1284", "countryCode": "vg"}, {
      "name": "Brunei Darussalam",
      "dialCode": "673",
      "countryCode": "bn"
    }, {"name": "Bulgaria", "dialCode": "359", "countryCode": "bg"}, {
      "name": "Burkina Faso",
      "dialCode": "226",
      "countryCode": "bf"
    }, {"name": "Burundi", "dialCode": "257", "countryCode": "bi"}, {
      "name": "Cambodia",
      "dialCode": "855",
      "countryCode": "kh"
    }, {"name": "Cameroon", "dialCode": "237", "countryCode": "cm"}, {
      "name": "Canada",
      "dialCode": "1",
      "countryCode": "ca"
    }, {"name": "Cape Verde", "dialCode": "238", "countryCode": "cv"}, {
      "name": "Caribbean Netherlands",
      "dialCode": "599",
      "countryCode": "bq"
    }, {"name": "Cayman Islands", "dialCode": "1345", "countryCode": "ky"}, {
      "name": "Central African Republic",
      "dialCode": "236",
      "countryCode": "cf"
    }, {"name": "Chad", "dialCode": "235", "countryCode": "td"}, {
      "name": "Chile",
      "dialCode": "56",
      "countryCode": "cl"
    }, {"name": "China", "dialCode": "86", "countryCode": "cn"}, {
      "name": "Christmas Island",
      "dialCode": "61",
      "countryCode": "cx"
    }, {"name": "Colombia", "dialCode": "57", "countryCode": "co"}, {
      "name": "Comoros",
      "dialCode": "269",
      "countryCode": "km"
    }, {"name": "Congo", "dialCode": "243", "countryCode": "cd"}, {
      "name": "Congo Republic",
      "dialCode": "242",
      "countryCode": "cg"
    }, {"name": "Cook Islands", "dialCode": "682", "countryCode": "ck"}, {
      "name": "Costa Rica",
      "dialCode": "506",
      "countryCode": "cr"
    }, {"name": "Cote Divoire", "dialCode": "225", "countryCode": "ci"}, {
      "name": "Croatia ",
      "dialCode": "385",
      "countryCode": "hr"
    }, {"name": "Cuba", "dialCode": "53", "countryCode": "cu"}, {
      "name": "Curacao",
      "dialCode": "599",
      "countryCode": "cw"
    }, {"name": "Cyprus", "dialCode": "357", "countryCode": "cy"}, {
      "name": "Czech Republic",
      "dialCode": "420",
      "countryCode": "cz"
    }, {"name": "Denmark", "dialCode": "45", "countryCode": "dk"}, {
      "name": "Djibouti",
      "dialCode": "253",
      "countryCode": "dj"
    }, {"name": "Dominica", "dialCode": "1767", "countryCode": "dm"}, {
      "name": "Dominican Republic",
      "dialCode": "1",
      "countryCode": "do"
    }, {"name": "Ecuador", "dialCode": "593", "countryCode": "ec"}, {
      "name": "Egypt",
      "dialCode": "20",
      "countryCode": "eg"
    }, {"name": "El Salvador", "dialCode": "503", "countryCode": "sv"}, {
      "name": "Equatorial Guinea",
      "dialCode": "240",
      "countryCode": "gq"
    }, {"name": "Eritrea", "dialCode": "291", "countryCode": "er"}, {
      "name": "Estonia",
      "dialCode": "372",
      "countryCode": "ee"
    }, {"name": "Ethiopia", "dialCode": "251", "countryCode": "et"}, {
      "name": "Falkland Islands (Malvinas)",
      "dialCode": "500",
      "countryCode": "fk"
    }, {"name": "Faroe Islands", "dialCode": "298", "countryCode": "fo"}, {
      "name": "Fiji",
      "dialCode": "679",
      "countryCode": "fj"
    }, {"name": "Finland", "dialCode": "358", "countryCode": "fi"}, {
      "name": "France",
      "dialCode": "33",
      "countryCode": "fr"
    }, {"name": "French Guiana", "dialCode": "594", "countryCode": "gf"}, {
      "name": "French Polynesia",
      "dialCode": "689",
      "countryCode": "pf"
    }, {"name": "Gabon", "dialCode": "241", "countryCode": "ga"}, {
      "name": "Gambia",
      "dialCode": "220",
      "countryCode": "gm"
    }, {"name": "Georgia", "dialCode": "995", "countryCode": "ge"}, {
      "name": "Germany",
      "dialCode": "49",
      "countryCode": "de"
    }, {"name": "Ghana", "dialCode": "233", "countryCode": "gh"}, {
      "name": "Gibraltar",
      "dialCode": "350",
      "countryCode": "gi"
    }, {"name": "Greece", "dialCode": "30", "countryCode": "gr"}, {
      "name": "Greenland",
      "dialCode": "299",
      "countryCode": "gl"
    }, {"name": "Grenada", "dialCode": "1473", "countryCode": "gd"}, {
      "name": "Guadeloupe",
      "dialCode": "590",
      "countryCode": "gp"
    }, {"name": "Guam", "dialCode": "1671", "countryCode": "gu"}, {
      "name": "Guatemala",
      "dialCode": "502",
      "countryCode": "gt"
    }, {"name": "Guernsey", "dialCode": "44", "countryCode": "gg"}, {
      "name": "Guinea",
      "dialCode": "224",
      "countryCode": "gn"
    }, {"name": "Guinea-Bissau", "dialCode": "245", "countryCode": "gw"}, {
      "name": "Guyana",
      "dialCode": "592",
      "countryCode": "gy"
    }, {"name": "Haiti", "dialCode": "509", "countryCode": "ht"}, {
      "name": "Honduras",
      "dialCode": "504",
      "countryCode": "hn"
    }, {"name": "Hong Kong", "dialCode": "852", "countryCode": "hk"}, {
      "name": "Hungary",
      "dialCode": "36",
      "countryCode": "hu"
    }, {"name": "Iceland", "dialCode": "354", "countryCode": "is"}, {
      "name": "India",
      "dialCode": "91",
      "countryCode": "in"
    }, {"name": "Indonesia", "dialCode": "62", "countryCode": "id"}, {
      "name": "Iran ",
      "dialCode": "98",
      "countryCode": "ir"
    }, {"name": "Iraq", "dialCode": "964", "countryCode": "iq"}, {
      "name": "Ireland",
      "dialCode": "353",
      "countryCode": "ie"
    }, {"name": "Isla De Man", "dialCode": "44", "countryCode": "im"}, {
      "name": "Israel",
      "dialCode": "972",
      "countryCode": "il"
    }, {"name": "Italy", "dialCode": "39", "countryCode": "it"}, {
      "name": "Jamaica",
      "dialCode": "1876",
      "countryCode": "jm"
    }, {"name": "Japan", "dialCode": "81", "countryCode": "jp"}, {
      "name": "Jersey",
      "dialCode": "44",
      "countryCode": "je"
    }, {"name": "Jordan", "dialCode": "962", "countryCode": "jo"}, {
      "name": "Kazakhstan",
      "dialCode": "7",
      "countryCode": "kz"
    }, {"name": "Kenya", "dialCode": "254", "countryCode": "ke"}, {
      "name": "Kiribati",
      "dialCode": "686",
      "countryCode": "ki"
    }, {"name": "Kosovo", "dialCode": "383", "countryCode": "xk"}, {
      "name": "Kuwait",
      "dialCode": "965",
      "countryCode": "kw"
    }, {"name": "Kyrgyzstan", "dialCode": "996", "countryCode": "kg"}, {
      "name": "Lao",
      "dialCode": "856",
      "countryCode": "la"
    }, {"name": "Latvia", "dialCode": "371", "countryCode": "lv"}, {
      "name": "Lebanon",
      "dialCode": "961",
      "countryCode": "lb"
    }, {"name": "Lesotho", "dialCode": "266", "countryCode": "ls"}, {
      "name": "Liberia",
      "dialCode": "231",
      "countryCode": "lr"
    }, {"name": "Libyan Arab Jamahiriya", "dialCode": "218", "countryCode": "ly"}, {
      "name": "Liechtenstein",
      "dialCode": "423",
      "countryCode": "li"
    }, {"name": "Lithuania", "dialCode": "370", "countryCode": "lt"}, {
      "name": "Luxembourg",
      "dialCode": "352",
      "countryCode": "lu"
    }, {"name": "Macau", "dialCode": "853", "countryCode": "mo"}, {
      "name": "Macedonia",
      "dialCode": "389",
      "countryCode": "mk"
    }, {"name": "Madagascar", "dialCode": "261", "countryCode": "mg"}, {
      "name": "Malawi",
      "dialCode": "265",
      "countryCode": "mw"
    }, {"name": "Malaysia", "dialCode": "60", "countryCode": "my"}, {
      "name": "Maldives",
      "dialCode": "960",
      "countryCode": "mv"
    }, {"name": "Mali", "dialCode": "223", "countryCode": "ml"}, {
      "name": "Malta",
      "dialCode": "356",
      "countryCode": "mt"
    }, {"name": "Marshall Islands", "dialCode": "692", "countryCode": "mh"}, {
      "name": "Martinique",
      "dialCode": "596",
      "countryCode": "mq"
    }, {"name": "Mauritania", "dialCode": "222", "countryCode": "mr"}, {
      "name": "Mauritius",
      "dialCode": "230",
      "countryCode": "mu"
    }, {"name": "Mayotte", "dialCode": "262", "countryCode": "yt"}, {
      "name": "Mexico",
      "dialCode": "52",
      "countryCode": "mx"
    }, {"name": "Micronesia", "dialCode": "691", "countryCode": "fm"}, {
      "name": "Moldova",
      "dialCode": "373",
      "countryCode": "md"
    }, {"name": "Monaco", "dialCode": "377", "countryCode": "mc"}, {
      "name": "Mongolia",
      "dialCode": "976",
      "countryCode": "mn"
    }, {"name": "Montenegro", "dialCode": "382", "countryCode": "me"}, {
      "name": "Montserrat",
      "dialCode": "1664",
      "countryCode": "ms"
    }, {"name": "Morocco", "dialCode": "212", "countryCode": "ma"}, {
      "name": "Mozambique",
      "dialCode": "258",
      "countryCode": "mz"
    }, {"name": "Myanmar", "dialCode": "95", "countryCode": "mm"}, {
      "name": "Namibia",
      "dialCode": "264",
      "countryCode": "na"
    }, {"name": "Nauru", "dialCode": "674", "countryCode": "nr"}, {
      "name": "Nepal",
      "dialCode": "977",
      "countryCode": "np"
    }, {"name": "Netherlands", "dialCode": "31", "countryCode": "nl"}, {
      "name": "New Caledonia",
      "dialCode": "687",
      "countryCode": "nc"
    }, {"name": "New Zealand", "dialCode": "64", "countryCode": "nz"}, {
      "name": "Nicaragua",
      "dialCode": "505",
      "countryCode": "ni"
    }, {"name": "Niger", "dialCode": "227", "countryCode": "ne"}, {
      "name": "Nigeria",
      "dialCode": "234",
      "countryCode": "ng"
    }, {"name": "Niue", "dialCode": "683", "countryCode": "nu"}, {
      "name": "Norfolk Island",
      "dialCode": "672",
      "countryCode": "nf"
    }, {"name": "Korea North ", "dialCode": "850", "countryCode": "kp"}, {
      "name": "Northern Mariana Islands",
      "dialCode": "1670",
      "countryCode": "mp"
    }, {"name": "Norway", "dialCode": "47", "countryCode": "no"}, {
      "name": "Oman",
      "dialCode": "968",
      "countryCode": "om"
    }, {"name": "Pakistan", "dialCode": "92", "countryCode": "pk"}, {
      "name": "Palau",
      "dialCode": "680",
      "countryCode": "pw"
    }, {"name": "Palestina", "dialCode": "970", "countryCode": "ps"}, {
      "name": "Panama",
      "dialCode": "507",
      "countryCode": "pa"
    }, {"name": "Papua New Guinea", "dialCode": "675", "countryCode": "pg"}, {
      "name": "Paraguay",
      "dialCode": "595",
      "countryCode": "py"
    }, {"name": "Peru", "dialCode": "51", "countryCode": "pe"}, {
      "name": "Philippines",
      "dialCode": "63",
      "countryCode": "ph"
    }, {"name": "Poland", "dialCode": "48", "countryCode": "pl"}, {
      "name": "Portugal",
      "dialCode": "351",
      "countryCode": "pt"
    }, {"name": "Puerto Rico", "dialCode": "1", "countryCode": "pr"}, {
      "name": "Qatar",
      "dialCode": "974",
      "countryCode": "qa"
    }, {"name": "Reunion", "dialCode": "262", "countryCode": "re"}, {
      "name": "Romania",
      "dialCode": "40",
      "countryCode": "ro"
    }, {"name": "Russian Federation", "dialCode": "7", "countryCode": "ru"}, {
      "name": "Rwanda",
      "dialCode": "250",
      "countryCode": "rw"
    }, {"name": "San Bartolomé", "dialCode": "590", "countryCode": "bl"}, {
      "name": "Saint Helena",
      "dialCode": "290",
      "countryCode": "sh"
    }, {"name": "Saint Kitts And Nevis", "dialCode": "1869", "countryCode": "kn"}, {
      "name": "Saint Lucia",
      "dialCode": "1758",
      "countryCode": "lc"
    }, {
      "name": "Saint Pierre And Miquelon",
      "dialCode": "508",
      "countryCode": "pm"
    }, {"name": "Saint Vincent And The Grenadines", "dialCode": "1784", "countryCode": "vc"}, {
      "name": "Samoa",
      "dialCode": "685",
      "countryCode": "ws"
    }, {"name": "San Marino", "dialCode": "378", "countryCode": "sm"}, {
      "name": "Sao Tome And Principe",
      "dialCode": "239",
      "countryCode": "st"
    }, {"name": "Saudi Arabia", "dialCode": "966", "countryCode": "sa"}, {
      "name": "Senegal",
      "dialCode": "221",
      "countryCode": "sn"
    }, {"name": "Serbia", "dialCode": "381", "countryCode": "rs"}, {
      "name": "Seychelles",
      "dialCode": "248",
      "countryCode": "sc"
    }, {"name": "Sierra Leone", "dialCode": "232", "countryCode": "sl"}, {
      "name": "Singapore",
      "dialCode": "65",
      "countryCode": "sg"
    }, {"name": "Sint Maarten", "dialCode": "1721", "countryCode": "sx"}, {
      "name": "Slovakia",
      "dialCode": "421",
      "countryCode": "sk"
    }, {"name": "Slovenia", "dialCode": "386", "countryCode": "si"}, {
      "name": "Solomon Islands",
      "dialCode": "677",
      "countryCode": "sb"
    }, {"name": "Somalia", "dialCode": "252", "countryCode": "so"}, {
      "name": "South Africa",
      "dialCode": "27",
      "countryCode": "za"
    }, {"name": "Korea South", "dialCode": "82", "countryCode": "kr"}, {
      "name": "South Sudan",
      "dialCode": "211",
      "countryCode": "ss"
    }, {"name": "Spain", "dialCode": "34", "countryCode": "es"}, {
      "name": "Sri Lanka",
      "dialCode": "94",
      "countryCode": "lk"
    }, {"name": "Sudan", "dialCode": "249", "countryCode": "sd"}, {
      "name": "Suriname",
      "dialCode": "597",
      "countryCode": "sr"
    }, {"name": "Svalbard And Jan Mayen Islands", "dialCode": "47", "countryCode": "sj"}, {
      "name": "Swaziland",
      "dialCode": "268",
      "countryCode": "sz"
    }, {"name": "Sweden", "dialCode": "46", "countryCode": "se"}, {
      "name": "Switzerland",
      "dialCode": "41",
      "countryCode": "ch"
    }, {"name": "Syrian Arab Republic", "dialCode": "963", "countryCode": "sy"}, {
      "name": "Taiwan",
      "dialCode": "886",
      "countryCode": "tw"
    }, {"name": "Tajikistan", "dialCode": "992", "countryCode": "tj"}, {
      "name": "Tanzania",
      "dialCode": "255",
      "countryCode": "tz"
    }, {"name": "Thailand", "dialCode": "66", "countryCode": "th"}, {
      "name": "Timor-Leste",
      "dialCode": "670",
      "countryCode": "tl"
    }, {"name": "Togo", "dialCode": "228", "countryCode": "tg"}, {
      "name": "Tokelau",
      "dialCode": "690",
      "countryCode": "tk"
    }, {"name": "Tonga", "dialCode": "676", "countryCode": "to"}, {
      "name": "Trinidad And Tobago",
      "dialCode": "1868",
      "countryCode": "tt"
    }, {"name": "Tunisia", "dialCode": "216", "countryCode": "tn"}, {
      "name": "Turkey",
      "dialCode": "90",
      "countryCode": "tr"
    }, {"name": "Turkmenistan", "dialCode": "993", "countryCode": "tm"}, {
      "name": "Turks And Caicos Islands",
      "dialCode": "1649",
      "countryCode": "tc"
    }, {"name": "Tuvalu", "dialCode": "688", "countryCode": "tv"}, {
      "name": "Virgin Islands (U.S.)",
      "dialCode": "1340",
      "countryCode": "vi"
    }, {"name": "Uganda", "dialCode": "256", "countryCode": "ug"}, {
      "name": "Ukraine",
      "dialCode": "380",
      "countryCode": "ua"
    }, {"name": "United Arab Emirates", "dialCode": "971", "countryCode": "ae"}, {
      "name": "United Kingdom",
      "dialCode": "44",
      "countryCode": "gb"
    }, {"name": "United States", "dialCode": "1", "countryCode": "us"}, {
      "name": "Uruguay",
      "dialCode": "598",
      "countryCode": "uy"
    }, {"name": "Uzbekistan", "dialCode": "998", "countryCode": "uz"}, {
      "name": "Vanuatu",
      "dialCode": "678",
      "countryCode": "vu"
    }, {"name": "Vatican City State", "dialCode": "39", "countryCode": "va"}, {
      "name": "Venezuela",
      "dialCode": "58",
      "countryCode": "ve"
    }, {"name": "Viet Nam", "dialCode": "84", "countryCode": "vn"}, {
      "name": "Wallis And Futuna Islands",
      "dialCode": "681",
      "countryCode": "wf"
    }, {"name": "Western Sahara", "dialCode": "212", "countryCode": "eh"}, {
      "name": "Yemen",
      "dialCode": "967",
      "countryCode": "ye"
    }, {"name": "Zambia", "dialCode": "260", "countryCode": "zm"}, {
      "name": "Zimbabwe ",
      "dialCode": "263",
      "countryCode": "zw"
    }, {"name": "Aaland Islands", "dialCode": "358", "countryCode": "ax"}];
    return countries;
  }
}