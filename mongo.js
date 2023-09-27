const mongoose = require('mongoose')

const closeConnectionAndExit = (exitCode) => {
  mongoose.connection.close().then(() => {
    process.exit(exitCode)
  }).catch(error => {
    console.error('Error closing connection:', error)
    process.exit(exitCode)
  })
}

const handleInvalidCommand = () => {
  console.log('invalid command')
  closeConnectionAndExit(1)
}

if (process.argv.length < 3 || process.argv.length > 5) {
  handleInvalidCommand()
  return
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.vqfmdnl.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).catch(handleInvalidCommand)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('phonebook:')
  Person.find({})
    .then(result => {
      result.forEach(person => console.log(person.name, person.number))
      closeConnectionAndExit(0)
    })
    .catch(error => {
      console.error(error)
      closeConnectionAndExit(1)
    })
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({ name, number })
    
  person.save()
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      closeConnectionAndExit(0)
    })
    .catch(error => {
      console.error(error)
      closeConnectionAndExit(1)
    })
} else {
  handleInvalidCommand()
}
