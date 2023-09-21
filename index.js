const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    let rand = Math.floor(
        Math.random() * 10000
    )

    if(persons.find(p => p.id === rand)) {
        rand = generateId()
    }

    return rand
}

app.get('/info', (request, response) => {
    const personsInfo = `Phonebook has info for ${persons.length} people`
    const timeStamp = new Date().toISOString()

    response.send(
        `<div>
            <p>${personsInfo}</p>
            <p>${timeStamp}</p>
        </div>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if(person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const person = request.body

    if(!person.name) {
        return response.status(400).json({
            error: 'missing name'
        })
    } else if(!person.number) {
        return response.status(400).json({
            error: 'missing number'
        })
    }

    if(persons.find(p =>
        p.name.toLowerCase() === person.name.toLowerCase())) {
        return response.status(400).json({
            error: `phonebook already contains ${person.name}`
        })
    }

    person.id = generateId()

    persons = persons.concat(person)

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})