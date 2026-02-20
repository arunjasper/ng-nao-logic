# Work Orders Timeline

A web page for visualizing, creating, and editing work orders across multiple work centers in a manufacturing ERP system.

## Development Approach

Component-Based Architecture: Applications are built as a tree of self-contained components, each managing its own view (HTML template), logic (TypeScript class), and styles (CSS).

## Angular Features

1) Stand alone Components
2) Signal based Reactivity
3) Zoneless change detection
4) HttpClient for API call (with mocked data)
5) NgRx Signal store for state management
6) angular-architects/ngrx-toolkit for sync to local/session for page refresh

## AI Assistance

GitHub Copilot was used to boost productivity and enable rapid development.

## Project Structure
```
NG-NAO-LOGIC/
├── public/
|   ├── api
|   |   ├── mock-work-centers.json
|   |   ├── mock-work-orders.json
|   |   ├── images
├── src/
│   ├── app/
|   |   ├── core
│   │   |   ├── models
│   │   |   |   ├── timeline.types.ts               # Models
│   │   |   ├── services                            # Services
│   │   |   |   ├── custom-date-formatter.ts        # Date Formatter helper service
│   │   |   |   ├── data-service.ts                 # API Calls
│   │   |   |   ├── form-validator.ts               # Date Formatter helper service
│   │   |   |   ├── timeline-grid-helper.ts         # Methods for timeline grid
│   │   |   |   ├── work-order-timeline-state       # Maintain application state
|   |   ├── features                                # Features Folder
|   |   |   ├──work-order-scheduler                 # Main Container component
|   |   |   |   ├──timeline-grid                    # Child component
|   |   |   |   ├──work-order-bar                   # Child component
|   |   |   |   ├──work-order-form                  # Child component
|   |   ├──shared                                   # Shared components
|   |   |   ├── components
|   |   |   |   ├──confirm                          # UI Control
|   |   |   |   ├──drawer                           # UI Control
│   │   ├── app.config.ts                           # Application configuration
│   │   ├── app.ts                                  # Main app component
│   │   └── app.html                                # Application routes
│   ├── _common.scss                                # Shared styles
│   ├── index.html                                  # Main HTML file
│   ├── main.ts                                     # Application entry point
│   └── styles.scss                                 # Global styles
├── angular.json                                    # Angular CLI configuration
├── package.json                                    # Project dependencies
├── tsconfig.json                                   # TypeScript configuration
└── README.md                                       # This file

```
## Technologies Used

```
Angular 21 - Frontend framework
TypeScript - Programming language
NgRx-SignalStore - State Management library
RxJS - Reactive programming library
NgRx-Toolkit - State persistence on page refresh (Session Storage/Local Storage)

```

# Demo


![NaoLogic application demo](./public/demo/demo.gif)



# NgNaoLogic

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.


## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

