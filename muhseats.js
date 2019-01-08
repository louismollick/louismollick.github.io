/* 

FULL CREDIT to Jennings Zhang, the meemer himself, for figuring out VSB
https://gitlab.com/snippets/1786103

check him out
https://jennydaman.gitlab.io/

*/

// Course Class : represent a course
class Course{
    constructor(term, code, crn){
        this.term = term;
        this.code = code;
        this.crn = crn;
    }
}

// UI Class: Handle UI Tasks
class UI {
    static displayCourses(){
        const courses = Store.getCourses();

        courses.forEach((course) => {
            UI.updateSeatsAndCourses(course, UI.addCourseToList);// pass in callback function
        });
    }
    static updateSeatsAndCourses(course, addCourseFunction){ // Gets seats from asynchronous XMLHttpRequest, then adds course to list
        let url = `https://vsb.mcgill.ca/vsb/getclassdata.jsp?term=${course.term}&course_0_0=${course.code}&rq_0_0=null${nWindow()}&nouser=1`;
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', 'https://cors-anywhere.herokuapp.com/' + url, true);
        xhr.onload = function () {
            if (this.status === 200){
                let xml = xhr.responseXML.querySelector('classdata').querySelector('course').querySelectorAll('uselection');
                for (let i = 0; i < xml.length; i++){
                    let section = xml[i].querySelector('selection').querySelectorAll('block');
                    for (let j = 0; j < section.length; j++){
                        if (section[j].getAttribute('cartid') === course.crn){
                            addCourseFunction(course,section[j].getAttribute('os')); //callback function
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
    }

    static addCourseToList(course, seats){
        const list = document.querySelector('#course-list');
        const row = document.createElement('tr');
        row.innerHTML =
        `
            <td>${course.term}</td>
            <td>${course.code}</td>
            <td>${course.crn}</td>
            <td>${seats}</td>
            <td><a href='#' class="btn btn-danger btn-sm delete">X</a></td>
        `;
        list.appendChild(row);
    }

    static deleteCourse(el){
        el.parentElement.parentElement.remove();
    }
    static showAlert(message, className){
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#course-form');
        container.insertBefore(div, form);

        // Vanish in 3 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static clearFields(){
        document.querySelector('#term').value = '';
        document.querySelector('#facc').value = '';
        document.querySelector('#number').value = '';
        document.querySelector('#crn').value = '';
    }
}

// Store Class: Handles Storage
class Store {
    static getCourses(){
        let courses;
        if (localStorage.getItem('courses') === null){
            courses = [];
        }
        else{
            courses = JSON.parse(localStorage.getItem('courses'));
        }

        return courses;
    }

    static addCourse(course){
        const courses = Store.getCourses();
        courses.push(course);

        localStorage.setItem('courses', JSON.stringify(courses));
    }

    static removeCourse(crn){
        const courses = Store.getCourses();
        courses.forEach((book, index) => {
            if(book.crn === crn){
                courses.splice(index, 1);
            }
        });
        localStorage.setItem('courses', JSON.stringify(courses));
    }
}

function nWindow() { //weird useless security attempt
    var f8b0=["\x26\x74\x3D","\x26\x65\x3D"];
    var t=(Math.floor((new Date())/60000))%1000;
    var e=t%3+t%19+t%42;
    return f8b0[0]+t+f8b0[1]+e;
}

// Event: Display Course
document.addEventListener('DOMContentLoaded', UI.displayCourses);

// Event: Add a Course
document.querySelector('#course-form').addEventListener('submit', (e) => {
    // Prevent actual submit
    e.preventDefault();

    // Get form values
    const term = document.querySelector('#term').value;
    const facc = document.querySelector('#facc').value;
    const number = document.querySelector('#number').value;
    const code = `${facc}-${number}`;
    const crn = document.querySelector('#crn').value;

    // Validate 
    if (term === '' || facc === '' || number === '' || crn === ''){
        UI.showAlert('Please fill in all fields.', 'danger');
    } else{
        // Instantiate Course
        const course = new Course(term, code, crn);

        // Add Course to UI
        UI.updateSeatsAndCourses(course, UI.addCourseToList); // pass in callback function

        // Add Course to Store
        Store.addCourse(course);

        // Show success message
        UI.showAlert("Course added.", 'success');

        // Clear fields
        UI.clearFields();
    }
});

// Event : Remove a Course
document.querySelector('#course-list').addEventListener('click', (e) => 
{
    if (e.target.classList.contains('delete')){
        // Remove course from UI
        UI.deleteCourse(e.target);
        // Remove course from Store
        Store.removeCourse(e.target.parentElement.previousElementSibling.previousElementSibling.textContent);
        UI.showAlert("Course removed.", 'success');
    }
});