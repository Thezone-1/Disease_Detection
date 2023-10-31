// import './tau-prolog';
const session = pl.create();

/**
 * @type {HTMLFormElement}
 * This is the parent form which contains all the questions that
 * are to be asked to the user for diagnosis
 */
const symptomsForm = document.getElementById("symptoms_form");

/**
 * @type {HTMLSelectElement}
 */
const outputSection = document.getElementById("output-section")

symptomsForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    outputSection.innerHTML = "" // clears all the previous content inside the node

    const data = new FormData(symptomsForm)
    const symptoms = data.getAll('symptoms')

    if (symptoms.length === 0) {
        outputSection.style.color = "red"
        outputSection.innerText = 'must select atleast one symptom for diagnosis'.toLocaleUpperCase()
        return
    }

    document.getElementById("submit-button").disabled = true;
    const diseaseArray = await findDiseases(symptoms)

    if (diseaseArray.length === 0) {
        // no matching disease found
        outputSection.style.color = "red"
        outputSection.innerText = 'We were unable to find any disease that matches your symptoms. Please consult a doctor as soon as possible.'.toLocaleUpperCase()

        symptomsForm.reset()
        document.getElementById("submit-button").disabled = false;
        return
    }

    outputSection.style.color = "black"
    const outputTitle = document.createElement("h3")
    outputTitle.innerText = "The diseases that you may have are - "
    const outputListContainer = document.createElement('ol')
    outputSection.appendChild(outputTitle)

    diseaseArray.forEach(disease => {
        const diseaseName = document.createElement('li');
        diseaseName.innerText = disease.replace("_", " ").toLocaleUpperCase();
        diseaseName.classList.add("symptom-name");
        outputListContainer.appendChild(diseaseName);
    });

    outputSection.appendChild(outputListContainer)
    symptomsForm.reset()
    document.getElementById("submit-button").disabled = false;
});


/**
 * 
 * @param {string[]} symptoms The array containing the appropriate predicate names of the symptom
 * These names must be adhered to the names used by prolog in knowledge_base.pl
 * @returns {string}
 */
function convertToPrologString(symptoms) {
    const prologString = symptoms.map(symptom => `${symptom}(X)`).join(', ');
    return `(${prologString})`;
}

async function findDiseases(symptoms_list) {
    const program = "knowledge_base.pl";
    const goal = `findall(X, ${convertToPrologString(symptoms_list)}, Diseases).`
    const session = pl.create();
    await session.promiseConsult(program);
    await session.promiseQuery(goal);
    let diseaseString = ''
    for await (let answer of session.promiseAnswers()) {
        diseaseString = session.format_answer(answer)
    }
    const matches = diseaseString.match(/\[(.*?)\]/);
    const diseaseArray = matches && (matches[1].length !== 0) ? matches[1].split(',').map(el => el.trim()) : [];
    return diseaseArray
}

