require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

//Morgan logger
morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})

morgan.format('tiny_with_body', ':method :url : status :res[content-length] - :response-time ms :body')

app.use((request, response, next) => {
  if(request.method === 'POST') {
    morgan('tiny_with_body')(request, response, next)
  } else {
    next()
  }
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const personsInfo = count === 1
        ? `Phonebook has info for ${count} person`
        : `Phonebook has info for ${count} people`
      const timeStamp = new Date().toISOString()

      response.send(
        `<div>
                    <p>${personsInfo}</p>
                    <p>${timeStamp}</p>
                </div>`)
    })
    .catch(error => next(error))
    
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })

  person.save()
    .then(() => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)
      response.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndUpdate(request.params.id,
    { number: request.body.number },
    { new: true })
    .then(result => {
      console.log('updated person')
      console.log(result)
      response.json(result)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      if(result) {
        console.log('delted person')
        console.log(result)
      } else {
        console.log(`attempted to delete person by id: ${request.params.id}`)
        console.log('no such person found')
      }
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/facvicon.ico', (request, response) => response.status(204).end())

//Unknown endpoint
app.use((request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
})

//Error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message})
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})