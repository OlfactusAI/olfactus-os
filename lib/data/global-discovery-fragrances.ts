import type {
  FragranceRecord,
  FragranceRole,
} from "@/lib/domain/fragrance";

type CatalogSeed = {
  id: string;
  brand: string;
  name: string;
  concentration: string;
  family: string;
  roles: FragranceRole[];
  seasons: [number, number, number, number];
  dna: [number, number, number, number, number, number, number, number];
  moods: string[];
  performance: [number, number];
};

function seed({
  id,
  brand,
  name,
  concentration,
  family,
  roles,
  seasons,
  dna,
  moods,
  performance,
}: CatalogSeed): FragranceRecord {
  return {
    id,
    brand,
    name,
    concentration,
    family,
    roles,
    seasons: {
      spring: seasons[0],
      summer: seasons[1],
      fall: seasons[2],
      winter: seasons[3],
    },
    dna: {
      fresh: dna[0],
      green: dna[1],
      woody: dna[2],
      amber: dna[3],
      sweet: dna[4],
      dark: dna[5],
      artistic: dna[6],
      formal: dna[7],
    },
    moods,
    performance: {
      projection: performance[0],
      longevity: performance[1],
    },
    intelligenceStatus: "calibration",
    intelligence: {
      confidence: 70,
      version: "DISCOVERY-1.0.0",
      reviewedBy: [
        "OLFACTUS curated seed",
      ],
    },
  };
}

export const globalDiscoveryFragrances: FragranceRecord[] = [
  seed({id:"creed-aventus",brand:"Creed",name:"Aventus",concentration:"Eau de Parfum",family:"Fruity Chypre",roles:["signature","office","formal","travel"],seasons:[90,82,90,70],dna:[78,38,72,32,38,30,74,82],moods:["confident","refined","versatile"],performance:[78,82]}),
  seed({id:"creed-green-irish-tweed",brand:"Creed",name:"Green Irish Tweed",concentration:"Eau de Parfum",family:"Green Aromatic",roles:["office","signature","travel"],seasons:[98,86,82,55],dna:[86,88,66,12,10,16,76,82],moods:["green","elegant","clean"],performance:[72,80]}),
  seed({id:"creed-original-vetiver",brand:"Creed",name:"Original Vetiver",concentration:"Eau de Parfum",family:"Citrus Vetiver",roles:["office","summer","travel","signature"],seasons:[94,96,72,42],dna:[92,76,62,10,12,8,64,76],moods:["clean","bright","refined"],performance:[66,74]}),
  seed({id:"creed-royal-oud",brand:"Creed",name:"Royal Oud",concentration:"Eau de Parfum",family:"Woody Spicy",roles:["formal","signature","winter"],seasons:[60,28,94,96],dna:[22,24,94,56,24,70,84,96],moods:["regal","dry","formal"],performance:[78,88]}),

  seed({id:"dior-sauvage-edt",brand:"Dior",name:"Sauvage",concentration:"Eau de Toilette",family:"Aromatic Fougere",roles:["casual","office","travel","signature"],seasons:[88,90,82,70],dna:[88,42,64,28,22,32,48,62],moods:["energetic","clean","confident"],performance:[88,82]}),
  seed({id:"dior-sauvage-elixir",brand:"Dior",name:"Sauvage Elixir",concentration:"Elixir",family:"Spicy Aromatic",roles:["formal","winter","date","signature"],seasons:[48,14,92,98],dna:[20,30,88,72,50,82,72,90],moods:["powerful","dark","confident"],performance:[98,98]}),
  seed({id:"dior-homme-intense",brand:"Dior",name:"Dior Homme Intense",concentration:"Eau de Parfum",family:"Iris Amber",roles:["date","formal","winter"],seasons:[45,12,92,98],dna:[14,8,58,72,66,62,90,94],moods:["elegant","romantic","luxurious"],performance:[82,90]}),
  seed({id:"dior-homme-parfum",brand:"Dior",name:"Dior Homme Parfum",concentration:"Parfum",family:"Iris Leather",roles:["formal","winter","date"],seasons:[36,8,94,100],dna:[8,8,72,68,54,82,96,98],moods:["dark","elegant","opulent"],performance:[92,96]}),
  seed({id:"dior-eau-sauvage",brand:"Dior",name:"Eau Sauvage",concentration:"Eau de Toilette",family:"Citrus Aromatic",roles:["office","summer","formal","travel"],seasons:[96,94,70,38],dna:[94,68,54,8,8,6,76,86],moods:["classic","bright","refined"],performance:[58,64]}),

  seed({id:"bleu-de-chanel-parfum",brand:"Chanel",name:"Bleu de Chanel Parfum",concentration:"Parfum",family:"Woody Aromatic",roles:["office","formal","signature","travel"],seasons:[90,76,92,84],dna:[74,32,82,42,28,34,68,92],moods:["refined","professional","confident"],performance:[72,88]}),
  seed({id:"chanel-allure-homme-sport",brand:"Chanel",name:"Allure Homme Sport",concentration:"Eau de Toilette",family:"Fresh Woody",roles:["casual","summer","travel","office"],seasons:[92,96,74,48],dna:[92,28,58,20,30,8,54,66],moods:["sporty","clean","energetic"],performance:[72,76]}),
  seed({id:"chanel-allure-homme-sport-eau-extreme",brand:"Chanel",name:"Allure Homme Sport Eau Extrême",concentration:"Eau de Parfum",family:"Aromatic Woody",roles:["casual","date","signature","travel"],seasons:[84,72,90,82],dna:[72,22,66,42,48,20,58,70],moods:["smooth","confident","versatile"],performance:[82,88]}),

  seed({id:"ysl-y-edp",brand:"Yves Saint Laurent",name:"Y Eau de Parfum",concentration:"Eau de Parfum",family:"Aromatic Fougere",roles:["office","casual","signature","travel"],seasons:[90,84,86,68],dna:[86,44,66,28,38,22,48,72],moods:["modern","clean","confident"],performance:[84,86]}),
  seed({id:"ysl-la-nuit-de-lhomme",brand:"Yves Saint Laurent",name:"La Nuit de L'Homme",concentration:"Eau de Toilette",family:"Spicy Aromatic",roles:["date","casual"],seasons:[66,38,94,92],dna:[26,22,52,58,48,56,70,70],moods:["seductive","smooth","intimate"],performance:[58,66]}),
  seed({id:"ysl-tuxedo",brand:"Yves Saint Laurent",name:"Tuxedo",concentration:"Eau de Parfum",family:"Amber Spicy",roles:["formal","date","signature"],seasons:[58,26,96,94],dna:[24,24,68,82,52,68,94,96],moods:["elegant","dark","luxurious"],performance:[78,86]}),

  seed({id:"armani-acqua-di-gio-parfum",brand:"Giorgio Armani",name:"Acqua di Giò Parfum",concentration:"Parfum",family:"Marine Aromatic",roles:["office","summer","signature","travel"],seasons:[92,94,82,52],dna:[90,46,62,20,14,20,58,74],moods:["clean","marine","professional"],performance:[74,82]}),
  seed({id:"armani-code-parfum",brand:"Giorgio Armani",name:"Armani Code Parfum",concentration:"Parfum",family:"Aromatic Iris",roles:["office","date","formal"],seasons:[74,48,90,88],dna:[48,26,62,46,40,38,72,90],moods:["smooth","formal","modern"],performance:[76,84]}),
  seed({id:"stronger-with-you-absolutely",brand:"Emporio Armani",name:"Stronger With You Absolutely",concentration:"Parfum",family:"Amber Gourmand",roles:["date","winter"],seasons:[28,8,88,98],dna:[10,8,48,86,94,68,62,68],moods:["warm","sweet","romantic"],performance:[88,94]}),

  seed({id:"versace-dylan-blue",brand:"Versace",name:"Dylan Blue",concentration:"Eau de Toilette",family:"Aromatic Fougere",roles:["casual","office","travel"],seasons:[88,90,80,60],dna:[86,42,64,26,24,28,44,64],moods:["fresh","confident","easygoing"],performance:[78,80]}),
  seed({id:"versace-eros-edp",brand:"Versace",name:"Eros Eau de Parfum",concentration:"Eau de Parfum",family:"Aromatic Amber",roles:["date","casual","winter"],seasons:[60,32,90,92],dna:[42,18,54,66,82,48,48,60],moods:["bold","sweet","nightlife"],performance:[84,88]}),

  seed({id:"jpg-le-male-le-parfum",brand:"Jean Paul Gaultier",name:"Le Male Le Parfum",concentration:"Eau de Parfum Intense",family:"Amber Spicy",roles:["date","formal","winter"],seasons:[48,18,94,98],dna:[22,12,56,78,74,60,68,82],moods:["seductive","warm","elegant"],performance:[84,90]}),
  seed({id:"jpg-le-beau-paradise-garden",brand:"Jean Paul Gaultier",name:"Le Beau Paradise Garden",concentration:"Eau de Parfum",family:"Green Aquatic",roles:["summer","casual","date","travel"],seasons:[92,98,66,30],dna:[88,76,48,18,48,12,62,46],moods:["tropical","green","playful"],performance:[80,84]}),

  seed({id:"azzaro-most-wanted-parfum",brand:"Azzaro",name:"The Most Wanted Parfum",concentration:"Parfum",family:"Amber Woody",roles:["date","winter","casual"],seasons:[42,14,94,98],dna:[14,10,58,82,88,64,54,62],moods:["sweet","bold","seductive"],performance:[88,92]}),
  seed({id:"azzaro-wanted-by-night",brand:"Azzaro",name:"Wanted by Night",concentration:"Eau de Parfum",family:"Woody Spicy",roles:["date","winter","casual"],seasons:[44,16,92,96],dna:[20,18,66,76,72,62,54,64],moods:["spicy","warm","nightlife"],performance:[90,92]}),

  seed({id:"valentino-uomo-born-in-roma-intense",brand:"Valentino",name:"Uomo Born in Roma Intense",concentration:"Eau de Parfum Intense",family:"Amber Vanilla",roles:["date","casual","winter"],seasons:[52,20,90,94],dna:[24,12,48,78,88,52,56,64],moods:["sweet","modern","seductive"],performance:[84,88]}),

  seed({id:"rabanne-1-million-elixir",brand:"Rabanne",name:"1 Million Elixir",concentration:"Parfum Intense",family:"Woody Gourmand",roles:["date","winter","casual"],seasons:[36,10,88,96],dna:[10,8,54,84,96,58,48,58],moods:["sweet","bold","opulent"],performance:[90,94]}),
  seed({id:"rabanne-invictus-victory-elixir",brand:"Rabanne",name:"Invictus Victory Elixir",concentration:"Parfum Intense",family:"Amber Woody",roles:["date","winter","casual"],seasons:[42,14,92,96],dna:[18,10,62,86,88,66,52,62],moods:["powerful","sweet","nightlife"],performance:[92,94]}),

  seed({id:"ralph-lauren-polo-blue-parfum",brand:"Ralph Lauren",name:"Polo Blue Parfum",concentration:"Parfum",family:"Woody Aromatic",roles:["office","casual","travel"],seasons:[88,86,82,58],dna:[82,46,70,22,24,24,48,70],moods:["clean","classic","relaxed"],performance:[70,78]}),

  seed({id:"tom-ford-ombre-leather",brand:"Tom Ford",name:"Ombré Leather",concentration:"Eau de Parfum",family:"Leather",roles:["formal","date","signature"],seasons:[54,22,94,96],dna:[18,16,68,44,24,88,88,92],moods:["dark","leathery","confident"],performance:[88,92]}),
  seed({id:"tom-ford-oud-wood",brand:"Tom Ford",name:"Oud Wood",concentration:"Eau de Parfum",family:"Woody Amber",roles:["formal","office","signature"],seasons:[68,40,92,92],dna:[30,22,92,54,28,62,90,94],moods:["dry","refined","luxurious"],performance:[70,78]}),
  seed({id:"tom-ford-tobacco-vanille",brand:"Tom Ford",name:"Tobacco Vanille",concentration:"Eau de Parfum",family:"Amber Spicy",roles:["formal","date","winter"],seasons:[28,6,90,100],dna:[6,6,42,92,96,82,86,90],moods:["opulent","warm","sweet"],performance:[94,98]}),

  seed({id:"mfk-baccarat-rouge-540",brand:"Maison Francis Kurkdjian",name:"Baccarat Rouge 540",concentration:"Eau de Parfum",family:"Amber Floral",roles:["signature","formal","date"],seasons:[76,52,92,92],dna:[48,10,54,88,76,42,96,88],moods:["radiant","luxurious","distinctive"],performance:[88,94]}),
  seed({id:"mfk-baccarat-rouge-540-extrait",brand:"Maison Francis Kurkdjian",name:"Baccarat Rouge 540 Extrait",concentration:"Extrait de Parfum",family:"Amber Woody",roles:["formal","signature","date","winter"],seasons:[66,34,96,98],dna:[32,8,64,94,82,58,98,94],moods:["dense","luxurious","radiant"],performance:[92,98]}),

  seed({id:"bvlgari-tygar",brand:"Bvlgari",name:"Le Gemme Tygar",concentration:"Eau de Parfum",family:"Citrus Woody",roles:["summer","office","signature","travel"],seasons:[94,98,78,44],dna:[96,36,68,20,20,12,78,80],moods:["bright","powerful","luxurious"],performance:[88,90]}),

  seed({id:"roja-elysium-pc",brand:"Roja Parfums",name:"Elysium Pour Homme Parfum Cologne",concentration:"Parfum Cologne",family:"Citrus Aromatic",roles:["summer","office","signature","travel"],seasons:[96,98,76,42],dna:[98,54,66,18,18,10,86,82],moods:["sparkling","refined","uplifting"],performance:[72,76]}),
  seed({id:"roja-enigma-pc",brand:"Roja Parfums",name:"Enigma Pour Homme Parfum Cologne",concentration:"Parfum Cologne",family:"Amber Spicy",roles:["date","formal","winter"],seasons:[42,14,94,98],dna:[16,10,56,88,78,76,94,94],moods:["boozy","luxurious","mysterious"],performance:[86,92]}),
  seed({id:"roja-amber-aoud",brand:"Roja Parfums",name:"Amber Aoud",concentration:"Parfum",family:"Amber Oud",roles:["formal","winter","signature"],seasons:[34,8,94,100],dna:[8,8,84,98,74,92,98,98],moods:["opulent","regal","dark"],performance:[96,100]}),

  seed({id:"amouage-reflection-man",brand:"Amouage",name:"Reflection Man",concentration:"Eau de Parfum",family:"Floral Woody Musk",roles:["office","formal","signature"],seasons:[94,78,88,72],dna:[72,40,68,28,28,14,92,96],moods:["elegant","clean","luxurious"],performance:[78,86]}),
  seed({id:"amouage-interlude-man",brand:"Amouage",name:"Interlude Man",concentration:"Eau de Parfum",family:"Amber Woody",roles:["winter","formal","signature"],seasons:[24,4,92,100],dna:[6,10,92,92,38,100,100,92],moods:["smoky","intense","artistic"],performance:[100,100]}),
  seed({id:"amouage-search",brand:"Amouage",name:"Search",concentration:"Eau de Parfum",family:"Citrus Smoky",roles:["summer","creative","signature"],seasons:[90,88,82,58],dna:[90,56,72,24,12,38,96,72],moods:["bright","smoky","artistic"],performance:[82,88]}),
  seed({id:"amouage-guidance",brand:"Amouage",name:"Guidance",concentration:"Eau de Parfum",family:"Floral Amber",roles:["formal","date","signature"],seasons:[74,42,94,94],dna:[34,18,60,90,76,54,98,92],moods:["creamy","opulent","artistic"],performance:[94,98]}),

  seed({id:"xerjoff-torino21",brand:"Xerjoff",name:"Torino21",concentration:"Eau de Parfum",family:"Citrus Aromatic",roles:["summer","travel","creative","casual"],seasons:[98,100,72,34],dna:[100,88,42,8,10,6,88,56],moods:["green","energizing","fresh"],performance:[80,84]}),
  seed({id:"xerjoff-erba-pura",brand:"Xerjoff",name:"Erba Pura",concentration:"Eau de Parfum",family:"Fruity Amber",roles:["casual","date","signature"],seasons:[78,68,90,84],dna:[58,10,34,72,98,30,64,54],moods:["fruity","loud","sweet"],performance:[96,98]}),
  seed({id:"xerjoff-alexandria-ii",brand:"Xerjoff",name:"Alexandria II",concentration:"Parfum",family:"Woody Amber",roles:["formal","winter","signature"],seasons:[40,10,96,100],dna:[8,8,94,94,70,86,100,98],moods:["opulent","woody","regal"],performance:[94,98]}),

  seed({id:"parfums-de-marly-layton",brand:"Parfums de Marly",name:"Layton",concentration:"Eau de Parfum",family:"Amber Fougere",roles:["date","signature","winter","casual"],seasons:[62,28,94,96],dna:[34,20,56,78,76,58,72,72],moods:["smooth","sweet","confident"],performance:[88,92]}),
  seed({id:"parfums-de-marly-carlisle",brand:"Parfums de Marly",name:"Carlisle",concentration:"Eau de Parfum",family:"Woody Spicy",roles:["winter","date","formal"],seasons:[34,8,96,100],dna:[10,10,76,88,82,82,84,84],moods:["dark","rich","seductive"],performance:[94,98]}),
  seed({id:"parfums-de-marly-herod",brand:"Parfums de Marly",name:"Herod",concentration:"Eau de Parfum",family:"Tobacco Amber",roles:["date","winter","formal"],seasons:[34,8,94,98],dna:[10,8,52,86,82,76,80,82],moods:["tobacco","warm","elegant"],performance:[78,84]}),
  seed({id:"parfums-de-marly-percival",brand:"Parfums de Marly",name:"Percival",concentration:"Eau de Parfum",family:"Aromatic Fougere",roles:["office","summer","travel","casual"],seasons:[94,94,76,48],dna:[94,48,58,14,18,10,58,68],moods:["fresh","clean","versatile"],performance:[82,84]}),

  seed({id:"initio-oud-for-greatness",brand:"Initio Parfums Privés",name:"Oud for Greatness",concentration:"Eau de Parfum",family:"Oud Spicy",roles:["formal","winter","signature"],seasons:[36,8,94,100],dna:[8,10,94,82,34,92,96,92],moods:["powerful","dark","luxurious"],performance:[94,98]}),
  seed({id:"initio-side-effect",brand:"Initio Parfums Privés",name:"Side Effect",concentration:"Eau de Parfum",family:"Amber Spicy",roles:["date","winter"],seasons:[34,8,92,98],dna:[10,8,48,90,82,80,80,70],moods:["boozy","seductive","warm"],performance:[90,94]}),

  seed({id:"maison-crivelli-oud-maracuja",brand:"Maison Crivelli",name:"Oud Maracujá",concentration:"Extrait de Parfum",family:"Fruity Oud",roles:["formal","signature","creative","winter"],seasons:[46,16,96,98],dna:[26,12,88,88,70,86,100,86],moods:["tropical","dark","artistic"],performance:[98,100]}),
  seed({id:"maison-crivelli-hibiscus-mahajad",brand:"Maison Crivelli",name:"Hibiscus Mahajád",concentration:"Extrait de Parfum",family:"Floral Leather",roles:["formal","date","signature"],seasons:[72,42,94,92],dna:[36,18,54,82,78,58,100,92],moods:["floral","luxurious","intense"],performance:[96,98]}),

  seed({id:"mancera-cedrat-boise",brand:"Mancera",name:"Cedrat Boise",concentration:"Eau de Parfum",family:"Citrus Woody",roles:["office","casual","signature","travel"],seasons:[90,84,88,64],dna:[84,34,76,28,34,26,62,70],moods:["fruity","woody","versatile"],performance:[82,88]}),
  seed({id:"mancera-red-tobacco",brand:"Mancera",name:"Red Tobacco",concentration:"Eau de Parfum",family:"Tobacco Spicy",roles:["winter","date"],seasons:[20,4,90,100],dna:[4,6,68,92,82,94,68,68],moods:["intense","spicy","sweet"],performance:[100,100]}),

  seed({id:"montale-arabians-tonka",brand:"Montale",name:"Arabians Tonka",concentration:"Eau de Parfum",family:"Amber Oud",roles:["winter","date","formal"],seasons:[28,6,92,100],dna:[8,8,74,94,94,78,70,78],moods:["sweet","powerful","opulent"],performance:[100,100]}),

  seed({id:"nasomatto-black-afgano",brand:"Nasomatto",name:"Black Afgano",concentration:"Extrait de Parfum",family:"Woody Aromatic",roles:["winter","creative","signature"],seasons:[22,4,92,100],dna:[4,16,92,76,32,100,100,76],moods:["dark","smoky","mysterious"],performance:[94,98]}),

  seed({id:"ortoparisi-megamare",brand:"Orto Parisi",name:"Megamare",concentration:"Parfum",family:"Marine Aromatic",roles:["summer","creative","signature"],seasons:[86,96,82,54],dna:[92,40,54,18,8,34,100,48],moods:["marine","intense","experimental"],performance:[100,100]}),

  seed({id:"essential-parfums-bois-imperial",brand:"Essential Parfums",name:"Bois Impérial",concentration:"Eau de Parfum",family:"Woody Aromatic",roles:["office","signature","creative","travel"],seasons:[92,78,92,78],dna:[70,52,92,24,14,24,88,82],moods:["modern","woody","clean"],performance:[84,88]}),

  seed({id:"matiere-premiere-falcon-leather",brand:"Matiere Premiere",name:"Falcon Leather",concentration:"Eau de Parfum",family:"Leather",roles:["formal","winter","signature"],seasons:[42,12,94,98],dna:[12,12,68,58,28,94,96,92],moods:["leathery","dark","luxurious"],performance:[92,94]}),

  seed({id:"penhaligons-blazing-mr-sam",brand:"Penhaligon's",name:"The Blazing Mr Sam",concentration:"Eau de Parfum",family:"Woody Spicy",roles:["formal","date","winter"],seasons:[46,18,94,96],dna:[18,18,74,72,44,72,84,90],moods:["spicy","confident","dapper"],performance:[86,90]}),

  seed({id:"byredo-bal-dafrique",brand:"Byredo",name:"Bal d'Afrique",concentration:"Eau de Parfum",family:"Woody Floral",roles:["casual","office","travel","signature"],seasons:[96,88,84,56],dna:[82,58,52,20,30,10,88,64],moods:["bright","artistic","effortless"],performance:[62,68]}),
  seed({id:"byredo-mojave-ghost",brand:"Byredo",name:"Mojave Ghost",concentration:"Eau de Parfum",family:"Woody Floral",roles:["casual","office","travel"],seasons:[94,88,82,54],dna:[78,40,54,18,34,8,86,62],moods:["airy","soft","modern"],performance:[58,64]}),

  seed({id:"diptyque-tam-dao-edp",brand:"Diptyque",name:"Tam Dao Eau de Parfum",concentration:"Eau de Parfum",family:"Woody",roles:["office","creative","signature"],seasons:[78,58,94,92],dna:[42,36,98,22,18,38,96,78],moods:["meditative","woody","calm"],performance:[66,76]}),
  seed({id:"diptyque-philosykos-edp",brand:"Diptyque",name:"Philosykos Eau de Parfum",concentration:"Eau de Parfum",family:"Green Woody",roles:["summer","creative","casual","travel"],seasons:[98,96,70,34],dna:[90,98,44,8,24,6,94,46],moods:["green","natural","airy"],performance:[62,68]}),

  seed({id:"le-labo-santal-33",brand:"Le Labo",name:"Santal 33",concentration:"Eau de Parfum",family:"Woody Aromatic",roles:["signature","creative","casual"],seasons:[82,68,94,84],dna:[58,54,96,18,14,38,96,70],moods:["dry","modern","distinctive"],performance:[78,84]}),
  seed({id:"le-labo-another-13",brand:"Le Labo",name:"Another 13",concentration:"Eau de Parfum",family:"Woody Musk",roles:["office","signature","travel"],seasons:[94,90,86,64],dna:[88,24,52,12,18,8,94,68],moods:["clean","minimal","airy"],performance:[72,82]}),

  seed({id:"frederic-malle-musc-ravageur",brand:"Frédéric Malle",name:"Musc Ravageur",concentration:"Eau de Parfum",family:"Amber Musk",roles:["date","winter","formal"],seasons:[40,10,94,98],dna:[12,8,46,92,78,74,100,88],moods:["sensual","warm","artistic"],performance:[88,92]}),
  seed({id:"frederic-malle-vetiver-extraordinaire",brand:"Frédéric Malle",name:"Vétiver Extraordinaire",concentration:"Eau de Parfum",family:"Woody Vetiver",roles:["office","formal","signature"],seasons:[94,86,88,62],dna:[78,82,92,10,8,22,96,90],moods:["dry","green","refined"],performance:[72,80]}),

  seed({id:"memo-african-leather",brand:"Memo Paris",name:"African Leather",concentration:"Eau de Parfum",family:"Leather Spicy",roles:["formal","winter","signature"],seasons:[52,20,96,96],dna:[22,30,72,62,32,86,94,90],moods:["spicy","leathery","adventurous"],performance:[86,90]}),

  seed({id:"lartisan-tea-for-two",brand:"L'Artisan Parfumeur",name:"Tea for Two",concentration:"Eau de Toilette",family:"Spicy Tea",roles:["creative","date","winter"],seasons:[50,18,94,96],dna:[20,28,42,62,58,58,100,68],moods:["smoky","tea","cozy"],performance:[66,72]}),

  seed({id:"guerlain-lhomme-ideal-edp",brand:"Guerlain",name:"L'Homme Idéal Eau de Parfum",concentration:"Eau de Parfum",family:"Amber Almond",roles:["date","winter","casual"],seasons:[50,18,94,96],dna:[24,14,50,76,86,58,76,70],moods:["sweet","elegant","romantic"],performance:[78,84]}),
  seed({id:"guerlain-spiritueuse-double-vanille",brand:"Guerlain",name:"Spiritueuse Double Vanille",concentration:"Eau de Parfum",family:"Amber Vanilla",roles:["date","formal","winter"],seasons:[40,12,94,98],dna:[12,8,40,90,96,62,96,86],moods:["vanilla","boozy","luxurious"],performance:[80,88]}),

  seed({id:"hermes-h24-edp",brand:"Hermès",name:"H24 Eau de Parfum",concentration:"Eau de Parfum",family:"Green Aromatic",roles:["office","creative","travel"],seasons:[96,88,84,60],dna:[86,94,54,16,12,10,88,72],moods:["green","metallic","modern"],performance:[68,76]}),

  seed({id:"louis-vuitton-limmensite",brand:"Louis Vuitton",name:"L'Immensité",concentration:"Eau de Parfum",family:"Citrus Aromatic",roles:["office","summer","travel","signature"],seasons:[96,98,76,40],dna:[98,46,58,12,12,8,78,78],moods:["bright","clean","luxurious"],performance:[78,84]}),
  seed({id:"louis-vuitton-afternoon-swim",brand:"Louis Vuitton",name:"Afternoon Swim",concentration:"Eau de Parfum",family:"Citrus",roles:["summer","travel","casual"],seasons:[98,100,58,20],dna:[100,46,28,4,10,2,72,44],moods:["juicy","bright","uplifting"],performance:[58,64]}),
  seed({id:"louis-vuitton-ombre-nomade",brand:"Louis Vuitton",name:"Ombre Nomade",concentration:"Eau de Parfum",family:"Oud Amber",roles:["formal","winter","signature"],seasons:[22,4,94,100],dna:[4,6,94,96,64,100,100,96],moods:["dark","opulent","powerful"],performance:[100,100]}),

  seed({id:"bdk-gris-charnel",brand:"BDK Parfums",name:"Gris Charnel",concentration:"Eau de Parfum",family:"Woody Spicy",roles:["date","creative","signature"],seasons:[66,34,94,92],dna:[34,30,72,58,52,48,96,76],moods:["creamy","spicy","intimate"],performance:[74,82]}),
  seed({id:"bdk-gris-charnel-extrait",brand:"BDK Parfums",name:"Gris Charnel Extrait",concentration:"Extrait de Parfum",family:"Woody Spicy",roles:["date","formal","winter"],seasons:[52,20,96,98],dna:[22,26,82,70,62,62,98,86],moods:["dense","spicy","elegant"],performance:[86,92]}),

  seed({id:"nishane-hacivat",brand:"Nishane",name:"Hacivat",concentration:"Extrait de Parfum",family:"Fruity Chypre",roles:["signature","office","formal","travel"],seasons:[92,84,92,72],dna:[80,54,78,26,28,30,82,84],moods:["confident","sharp","refined"],performance:[94,96]}),
  seed({id:"nishane-ani",brand:"Nishane",name:"Ani",concentration:"Extrait de Parfum",family:"Amber Vanilla",roles:["date","winter","signature"],seasons:[50,18,94,98],dna:[22,18,50,82,90,62,86,74],moods:["vanilla","spicy","warm"],performance:[90,94]}),

  seed({id:"tiziana-terenzi-kirke",brand:"Tiziana Terenzi",name:"Kirke",concentration:"Extrait de Parfum",family:"Fruity Musk",roles:["casual","date","signature"],seasons:[82,72,88,72],dna:[62,10,28,56,98,26,70,48],moods:["fruity","loud","playful"],performance:[96,98]}),
];

const forbiddenDuplicateIds =
  new Set([
    "imagination",
    "ganymede",
    "grand-soir",
    "prada-lhomme",
    "terre",
    "naxos",
    "un-air",
    "bottled-absolu",
  ]);

if (
  globalDiscoveryFragrances.some(
    (fragrance) =>
      forbiddenDuplicateIds.has(
        fragrance.id,
      ),
  )
) {
  throw new Error(
    "Global Discovery Catalog duplicates a core bundled fragrance ID.",
  );
}
