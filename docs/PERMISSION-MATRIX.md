# Permission model and initial matrix

This is a policy baseline, not a complete operational permission grant. Real role grants must be reviewed and configured by the institution before real data is loaded.

| Role family | Default scope | Global audit | Student account creation | Official academic changes |
|---|---|---|---|---|
| Developer | Engineering diagnostics only | No | No by default | No by default |
| IT Manager | Explicitly granted technical operations | No by default | Only when explicitly granted | No by default |
| Chairman / Vice Chairman / Trustee | Individually assigned governance scopes | Only if explicitly granted `audit.read` | No by default | Approval rights only when configured |
| Principal / Vice Principal | Explicit institutional scopes | No by default | No by default | Only assigned review/approval permissions |
| Coordinator | Assigned academic scope | No | No | Only assigned academic permissions |
| Admission Officer | Admission and enrollment scope | No | Controlled admission workflow only | Admission workflow only |
| Teacher | Assigned teaching scope | No | No | Assigned attendance/marks/diary operations |
| Form Teacher | Assigned section and academic year | No | No | Assigned class-management functions only |
| Class Captain | Temporary section-scoped student appointment | No | No | No official attendance/marks/admission changes |
| Student | Own account and published class information | No | No | No |

Authorization must combine a permission grant with active assignment dates, record relationship, institutional scope, and workflow state. UI navigation visibility is not authorization.

Global audit read and export are separate privileges. Reading audit records and exporting them should each generate an audit event, with sensitive search and bulk extraction monitored.
