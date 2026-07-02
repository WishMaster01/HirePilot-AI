# Architecture

The project keeps existing working APIs intact while adding a scalable feature/module folder structure.

- Frontend feature folders expose API and utility entry points.
- Backend `src/modules/*` folders expose route, controller, service, validator, and constants wrappers.
- Existing root controllers/routes remain as compatibility implementations.
