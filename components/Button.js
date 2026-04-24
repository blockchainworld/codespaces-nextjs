import styles from './Button.module.css'

export default function Button({ className = '', ...props }) {
  const classes = className ? `${styles.btn} ${className}` : styles.btn

  return <button type="button" className={classes} {...props} />
}
