const term = '201901';
const course = 'MATH-263';
const crn = '3019';
const url = `https://vsb.mcgill.ca/vsb/getclassdata.jsp?term=${term}&course_0_0=${course}&rq_0_0=null${nWindow()}&nouser=1`;

function nWindow() {
    var f8b0=["\x26\x74\x3D","\x26\x65\x3D"];
    var t=(Math.floor((new Date())/60000))%1000;
    var e=t%3+t%19+t%42;
    return f8b0[0]+t+f8b0[1]+e;
}

let xhr = new XMLHttpRequest();
xhr.responseType = 'document';
xhr.open('GET', 'https://cors-anywhere.herokuapp.com/' + url, true);
let i = 1;
xhr.onload = function () {
    if (this.status === 200){
        xml = xhr.responseXML.getElementsByTagName('classdata')[0].getElementsByTagName('course')[0].getElementsByTagName('uselection');
        for (let i = 0; i < xml.length; i++){
            let section = xml[i].getElementsByTagName('selection')[0].getElementsByTagName('block');
            for (let j = 0; j < section.length; j++){
                if (section[j].getAttribute('cartid') == crn){
                    console.log(section[j].getAttribute('os'));
                }
            }
        }
    }
    else{
        document.write(xhr.statusText);
    }
};
xhr.onerror = function () {
    document.write('xhr error');
};
xhr.send();